## Git 基本命令

## 创建公钥

```bash
## 创建
ssh-keygen -t ed25519 -C "2436847447@qq.com"

## 查看
cat ~/.ssh/id_ed25519.pub
```

## 常用工作流程

### 日常开发流程

```bash
git remote remove origin      # 删除现有远程仓库

git init                      # 初始化仓库
git add .                     # 添加更改
git commit -m "提交信息"       # 提交更改

git remote add origin <url>   # 添加远程仓库
git push -u origin main       # 首次推送并设置上游分支
git push                      # 推送到远程仓库
```

### 紧急修复流程

```bash
git stash                     # 保存当前工作
git checkout main             # 切换到主分支
git remote remove origin
git pull origin main          # 更新主分支
git checkout -b hotfix-xxx    # 创建修复分支
# 进行修复...
git add . && git commit -m "提交信息"
git checkout main             # 切回主分支
git merge hotfix-xxx          # 合并修复
git push origin main          # 推送修复
git stash pop                 # 恢复之前的工作
```



### 初始化与克隆

```bash
cd project/                    # 进入项目目录
git init                      # 初始化新仓库
git clone <repository>        # 克隆远程仓库
```

### 文件操作
```bash
git add filename              # 添加特定文件
git add .                     # 添加所有文件
git add *.js                  # 添加所有js文件
git add src/                  # 添加整个目录

git rm filename               # 删除文件并暂存
git mv oldname newname        # 重命名文件
```

### 提交管理
```bash
git commit -m "提交说明"       # 提交更改
git commit -am "提交说明"      # 添加并提交所有已跟踪文件
git commit --amend            # 修改最近一次提交

git status                    # 查看工作区状态
git status -s                 # 简洁状态显示
```

## Git 分支管理

```bash
git branch                    # 查看分支列表
git branch new-branch         # 创建新分支
git checkout branch-name      # 切换分支
git checkout -b new-branch    # 创建并切换到新分支

git merge branch-name         # 合并分支
git branch -d branch-name     # 删除分支
git branch -D branch-name     # 强制删除未合并分支
```

## 远程仓库操作

```bash
git remote -v                 # 查看远程仓库
git remote remove origin      # 删除现有远程仓库
git remote add origin <url>   # 添加远程仓库

git push -u origin main       # 首次推送并设置上游分支
git push                      # 推送到远程仓库
git pull                      # 从远程拉取更新

git fetch                     # 下载远程更新但不合并
git fetch --prune             # 清理已删除的远程分支
```

## Git 回滚管理

### 撤销未提交的修改
```bash
git restore file.txt          # 丢弃工作区单个文件修改
git restore .                 # 丢弃所有工作区修改
git restore --staged file.txt # 取消单个文件的暂存
git restore --staged .        # 取消所有文件的暂存

git checkout -- file.txt      # 旧版本命令（效果相同）
git reset HEAD file.txt       # 旧版本取消暂存
```

### 查看历史
```bash
git log                       # 详细提交历史
git log --oneline             # 简洁提交历史
git log --graph               # 图形化显示分支历史
git log -p                    # 显示具体修改内容
```

### 撤销已提交的修改
```bash
# 安全回滚（推荐用于公共分支）
git revert <commit-hash>      # 创建新的提交来撤销更改

# 重置回退（谨慎使用）
git reset --soft HEAD~1       # 回退提交但保留更改在暂存区
git reset --mixed HEAD~1      # 回退提交且取消暂存（默认）
git reset --hard HEAD~1       # 彻底回退，丢弃所有更改

# 回滚到特定提交
git reset --hard <commit-hash>

# 返回到上一次提交
git reset --hard HEAD^
```

## 实用配置与工具

```bash
git config --global user.name "Your Name"
git config --global user.email "email@example.com"

git diff                      # 查看未暂存的修改
git diff --staged             # 查看已暂存的修改

git stash                     # 临时保存工作进度
git stash pop                 # 恢复最近的工作进度

git tag v1.0.0                # 创建标签
git push origin v1.0.0        # 推送标签到远程
```

