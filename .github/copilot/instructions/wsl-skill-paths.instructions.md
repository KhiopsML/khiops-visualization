---
name: wsl-skill-paths
description: "ALWAYS check BEFORE loading or reading any skill file, SKILL.md, or file with a Windows-style path. MANDATORY for all skill loading in WSL."
---

# WSL Path Conversion for Skill Loading

Before reading any skill file, convert Windows drive letter paths to WSL mount paths:
- `c:/` → `/mnt/c/`
- `d:/` → `/mnt/d/`