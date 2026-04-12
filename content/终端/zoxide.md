### 介绍

>  zoxide 是一个可以快速跳转到常用文件地址的工具

使用起来十分方便，只需要 `z note`就可以从任意目录跳转到常用的note文件夹，但是需要先访问一次

### 1. 安装 zoxide

```powershell
winget install ajeetdsouza.zoxide
```

### 2. 配置你的 Shell

安装完成后，需要将 `zoxide` 集成到你使用的命令行环境

在 PowerShell 中输入 `code $PROFILE` 打开配置文件

并添加以下内容后保存

```powershell
Invoke-Expression (& { (zoxide init powershell | Out-String) })
```

### 3. 重新加载配置文件

在 PowerShell 中运行（使刚才的修改立即生效，无需重启终端）：

```powershell
. $PROFILE
```

### 4.使用方法

命令：`z 需要访问的文件夹名称`，比如：

```powershell
z blog
```

条件是：必须在配置好`zoxide`之后访问一次目录，才可以记录这个地址，并在下次访问

### 4.工作原理

1. 每次cd或者z的时候都会记录访问地址，通过**频率**（访问次数）和**时效性**（最近访问时间）来为每个目录计算分数

2. 这样每次都会匹配都会访问分数最高的地址

### 5.常用命令

```powershell
使用方法：
  z    <文件夹> 快速跳转
  zoxide <命令>
命令：
  add     添加一个新目录或增加其排名
  edit    编辑数据库
  import  从另一个应用导入条目
  init    生成 shell 配置
  query   在数据库中搜索目录
  remove  从数据库中移除目录
  
zoxide query golang # 返回最匹配 golang 的目录
zoxide query golang --list # 返回所有匹配 golang 的目录
zoxide -h # 更多帮助信息
```


### 参考文件

1. [zoxide | 我的终端环境](https://www.poloxue.com/mytermenv/docs/commands/filesystem/zoxide/)

2. [推荐给程序员的终端神器，一键跳去常用目录]([推荐给程序员的终端神器，一键跳去常用目录_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV18EPnzvEDS/?spm_id_from=333.1007.tianma.3-1-7.click&vd_source=4b2a3aa4c1475ef90a44549a323239ae))

   