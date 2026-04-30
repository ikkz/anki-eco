import Router from '@koa/router';
import Koa from 'koa';
import fs from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin } from 'rolldown';

const log = (...args: any[]) => console.log('[devServer]', ...args);

const devServer = ({ port = 3000 } = {}) => {
  const koa = new Koa();
  const router = new Router();
  const clients = new Set<ServerResponse>();

  router.get('/__dev_server', (ctx) => {
    ctx.respond = false;

    ctx.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    ctx.res.write(': connected\n\n');

    clients.add(ctx.res);
    ctx.req.on('close', () => {
      clients.delete(ctx.res);
    });
  });

  const sendCommand = (cmd: string) => {
    clients.forEach((res) => {
      if (res.destroyed || res.writableEnded) {
        clients.delete(res);
        return;
      }
      res.write(`data: ${cmd}\n\n`);
    });
  };

  let html = '';
  router.get('/', (ctx) => {
    ctx.body = html;
  });

  koa.use(router.routes()).use(router.allowedMethods());
  koa.listen(port, '0.0.0.0');

  let firstBundle = true;

  log('bundling...');

  return {
    name: 'dev-server',
    watchChange() {
      sendCommand('update');
      log('rebundling...');
    },
    async generateBundle(_, bundle) {
      let body = '';
      Object.values(bundle).forEach((file) => {
        if (
          file.type === 'asset' &&
          path.extname(file.fileName) === '.html' &&
          !file.fileName.endsWith('back.html')
        ) {
          body += file.source;
        }
      });
      body += `<script> ${await fs.readFile(path.resolve(import.meta.dirname, 'runtime.js'), { encoding: 'utf-8' })} </script>`;
      html = `<!DOCTYPE html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body>${body}</body>
`;
      sendCommand('refresh');
      if (firstBundle) {
        firstBundle = false;
        log('ready to dev:', `http://localhost:${port}`);
      } else {
        log('refresh sent');
      }
    },
  } as Plugin;
};

export default devServer;
