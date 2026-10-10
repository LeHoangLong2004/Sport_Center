const fs = require('fs');
const path = 'e:\\Coding\\Code\\SWP\\Sport_Center\\Frontend\\src\\MemberPortalV2.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const scheduleContent = `import { useState, useEffect } from "react";\nimport { Navigate } from "./types";\nimport { Shell } from "./MemberShellV2";\n\n` + lines.slice(107, 357).join('\n');
fs.writeFileSync('e:\\Coding\\Code\\SWP\\Sport_Center\\Frontend\\src\\pages\\MemberPortal\\views\\v2\\ScheduleV2.tsx', scheduleContent);

const aiContent = `import { FormEvent, useState } from "react";\nimport { Navigate } from "./types";\nimport { Shell } from "./MemberShellV2";\n\n` + lines.slice(507, 626).join('\n');
fs.writeFileSync('e:\\Coding\\Code\\SWP\\Sport_Center\\Frontend\\src\\pages\\MemberPortal\\views\\v2\\AiAssistantV2.tsx', aiContent);

console.log("Done slicing");
