const fs = require('fs');

let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf-8');

// The file has two places where this happens (register and login).

code = code.replaceAll(
  `              <button \n                type="button" \n                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"\n              >\n                 <GoogleIcon />`,
  `              <button \n                type="button" \n                onClick={() => handleOAuthLogin('google')}\n                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"\n              >\n                 <GoogleIcon />`
);

code = code.replaceAll(
  `              <button \n                type="button" \n                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"\n              >\n                 <FacebookIcon />`,
  `              <button \n                type="button" \n                onClick={() => handleOAuthLogin('facebook')}\n                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border border-zinc-700/50 hover:bg-zinc-800/50 transition-all text-white font-medium text-[14px]"\n              >\n                 <FacebookIcon />`
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
