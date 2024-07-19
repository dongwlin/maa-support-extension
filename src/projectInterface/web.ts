import * as maa from '@nekosu/maa-node'
import * as vscode from 'vscode'

import type { ExtToWeb, WebToExt } from '../../types/ipc'
import { commands } from '../command'
import { Service } from '../data'

function toPngDataUrl(buffer: ArrayBuffer) {
  return 'data:image/png;base64,' + Buffer.from(buffer).toString('base64')
}

export class ProjectInterfaceWebProvider extends Service {
  panel: vscode.WebviewPanel | null

  constructor(context: vscode.ExtensionContext) {
    super(context)

    this.panel = null

    this.defer = vscode.commands.registerCommand(commands.OpenWeb, async () => {
      ;(await this.acquire()).reveal()
    })
  }

  acquire(create?: true): Promise<vscode.WebviewPanel>
  acquire(create: false): Promise<vscode.WebviewPanel | null>
  acquire(create: boolean): Promise<vscode.WebviewPanel | null>
  async acquire(create = true) {
    if (!this.panel && create) {
      const rootUri = vscode.Uri.file(this.__context.asAbsolutePath('web'))

      this.panel = vscode.window.createWebviewPanel(
        'maa.Webview',
        'Maa Support',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          localResourceRoots: [rootUri]
        }
      )
      this.panel.onDidDispose(() => {
        this.panel = null
      })
      const content = Buffer.from(
        await vscode.workspace.fs.readFile(vscode.Uri.joinPath(rootUri, 'index.html'))
      )
        .toString()
        .replaceAll('/@ROOT@', this.panel.webview.asWebviewUri(rootUri).toString())
      this.panel.webview.html = content

      this.panel.webview.onDidReceiveMessage((data: WebToExt) => {
        switch (data.cmd) {
          case 'launch.reco':
            const info = new maa.RecoInfo(data.reco as maa.RecoId)
            const raw = new maa.ImageBuffer()
            const draws = new maa.ImageListBuffer()
            const detailInfo = info.detail(raw, draws)
            if (!detailInfo) {
              return
            }
            detailInfo.detail_json = JSON.stringify(JSON.parse(detailInfo.detail_json), null, 4)
            this.post({
              cmd: 'show.reco',
              raw: toPngDataUrl(raw.encoded),
              draws: Array.from({ length: draws.size }, (_, i) =>
                toPngDataUrl(draws.at(i).encoded)
              ),
              info: detailInfo
            })
            return
        }
      })
    }
    return this.panel
  }

  async post(msg: ExtToWeb, create = true) {
    return await (await this.acquire(create))?.webview.postMessage(msg)
  }
}