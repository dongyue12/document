# git命令
| 命令  | 精简描述 |
| --- | --- |
| `git init` | 初始化新仓库 |
| `git add .` | 添加所有更改到暂存区 |
| `git add <file>` | 添加指定文件到暂存区 |
| `git commit -m "信息"` | 提交暂存区文件到仓库 |
| `git log --oneline` | 查看简洁提交历史 |
| `git checkout <commit-hash>` | 切换到指定提交（只读） |
| `git remote -v` | 列出远程仓库及地址 |
| `git branch` | 列出本地分支 |
| `git checkout <branch-name>` | 切换到指定分支 |
| `git branch -m <旧名> <新名>` | 重命名本地分支 |
| `git merge <branch-name>` | 合并指定分支到当前分支 |
| `git pull origin <branch-name>` | 拉取并合并远程分支 |
| `git branch -d <branch-name>` | 删除已合并分支 |
| `git branch -D <branch-name>` | 强制删除本地分支 |
| `git branch -M main` | 修改本地分支名字 |
| `git remote add <别名> <地址>` | 添加远程仓库 |
| `git push origin <branch-name>` | 推送当前分支到远程 |
| `git push -u origin <branch-name>` | 推送并设置上游 |
| `git push origin <branch-name> --force` | 强制推送覆盖远程（慎用） |
| `git remote set-url origin <地址>` | 修改远程仓库地址 |
| `git remote rm <别名>` | 删除远程仓库关联 |
| `git push origin --delete <branch-name>` | 删除远程分支 |