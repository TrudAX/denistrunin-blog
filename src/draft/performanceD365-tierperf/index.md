---
title: "Improve the speed for bacpac database restore from Tier2 to Tier1"
date: "2022-05-17T22:12:03.284Z"
tags: ["XppDEVTutorial", "Integration"]
path: "/performance-restoretier2"
featuredImage: "./logo.png"
excerpt: "The blog post describes a sample approach to implement recurring file-based integration in D365FO using X++"
---

Working with actual data is a very important of the delelopment process.  

```powershell
$StartTime = get-date 
Import-D365Bacpac -BacpacFile "J:\LCS\PreProd2022_05_24.bacpac" -ImportModeTier1 -NewDatabaseName PreProd2022_05_24_2
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 
```

restore on local server
Intel core i9 10900 2.8GHz(up 4.8Gz)

Azure D8v3 E5-2673 v4  (2.3Ghz)

```powershell 
$StartTime = get-date 
Import-D365Bacpac -BacpacFile "C:\Temp\PreProd2022_05_24.bacpac" -ImportModeTier1 -NewDatabaseName PreProd2022_05_24_2  -DatabaseServer "SDS-WS83" -SqlUser denis -SqlPwd "Pass" 
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 
```

```SQL
USE [master]
GO
ALTER DATABASE [PreProd2022_05_24_2] SET RECOVERY SIMPLE WITH NO_WAIT
GO
ALTER DATABASE [PreProd2022_05_24_2] SET DELAYED_DURABILITY = FORCED WITH NO_WAIT
GO
```

small file ~ 94MB  2248.00 MB
standard file ~ 2.5GB  24798.19 MB

small file, core i9, all standard
Execution time was 0 hours, 21 minutes, 33 seconds

small file, core i9, disabled durability
Execution time was 0 hours, 20 minutes, 11 seconds

azure VM, small file, all standard
Execution time was 1 hours, 16 minutes, 24 seconds

azure VM, small file, core i9, durability = forced
Execution time was 0 hours, 46 minutes, 35 seconds

large file all standard 
Execution time was 1 hours, 23 minutes, 50 seconds

large file disabled durability
Execution time was 1 hours, 20 minutes, 12 seconds

large file disabled durability, /p:RebuildIndexesOfflineForDataPhase=True
Execution time was 1 hours, 7 minutes, 9 seconds

small file /p:RebuildIndexesOfflineForDataPhase=True /MaxParallelism:32 /p:DisableIndexesForDataPhase=FALSE
Execution time was 0 hours, 21 minutes, 1 seconds

large file /p:RebuildIndexesOfflineForDataPhase=True /MaxParallelism:32 /p:DisableIndexesForDataPhase=FALSE
Execution time was 0 hours, 51 minutes, 15 seconds

azure VM
large file, durability enabled = true



## Summary


Another important question when you implement a solution like this: is how fast will be your integration. I wrote about sample steps for performance testing in the following post: [D365FO Performance. Periodic import of one million ledger journal lines](https://denistrunin.com/xpptools-fileintegledgerperf/) 

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.