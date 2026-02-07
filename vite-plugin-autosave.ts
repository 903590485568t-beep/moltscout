import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const autoSavePlugin = (): Plugin => {
  return {
    name: 'auto-save-claw-token',
    configureServer(server) {
      server.middlewares.use('/__save-claw-token', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { mint, name, symbol } = JSON.parse(body);
              console.log(`[AutoSave] Received token: ${name} (${mint})`);

              // Update src/clawConfig.ts
              const configPath = path.resolve(process.cwd(), 'src/clawConfig.ts');
              
              if (fs.existsSync(configPath)) {
                  let content = fs.readFileSync(configPath, 'utf-8');
                  
                  // We look for: officialMintAddress: null (or similar)
                  // and replace it with the new mint
                  const regex = /officialMintAddress:\s*(null|undefined|'[^']*'|"[^"]*")/;
                  
                  if (regex.test(content)) {
                      content = content.replace(regex, `officialMintAddress: '${mint}'`);
                      fs.writeFileSync(configPath, content);
                      console.log('[AutoSave] Updated clawConfig.ts');
                      
                      // Execute Git commands
                      // git add . -> git commit -> git push
                      exec('git add src/clawConfig.ts && git commit -m "Auto-detected MoltScout token: ' + mint + '" && git push', (err, stdout, stderr) => {
                          if (err) {
                              console.error('[AutoSave] Git command failed:', stderr);
                              // We still return 200 because the file was updated locally
                          } else {
                              console.log('[AutoSave] Git push success:', stdout);
                          }
                      });
                      
                      res.statusCode = 200;
                      res.end(JSON.stringify({ success: true, message: 'Updated and pushing to git' }));
                  } else {
                      console.error('[AutoSave] Could not find officialMintAddress in config');
                      res.statusCode = 500;
                      res.end(JSON.stringify({ error: 'Config pattern not found' }));
                  }
              } else {
                  console.error('[AutoSave] Config file not found');
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Config file not found' }));
              }

            } catch (e) {
              console.error('[AutoSave] Error processing request', e);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid request' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
};
