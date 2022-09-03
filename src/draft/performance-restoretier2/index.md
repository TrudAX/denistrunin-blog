---
title: "Improve the speed for bacpac database restore from Tier2 to Tier1"
date: "2022-05-17T22:12:03.284Z"
tags: ["XppDEVTutorial", "Integration"]
path: "/performance-restoretier2"
featuredImage: "./logo.png"
excerpt: "The blog post describes a sample approach to implement recurring file-based integration in D365FO using X++"
---

Working with the real data is a very important of the delelopment process, espesially during the support phase. One of the issues you may face is the different database format on development VMs(that are using SQL Server) and UAT-PROD Tier2 enviroments that are using SQL Azure as database.

One of the workaroud is to use debugger on Tier2(link here), but in this article we consider a restore backpack from a Tier2 to Tier1 enviroment.

SQL backpac format is a zip file that contains tables data in CSV format. If you change extension to zip and open it in archive tool you see someting like that

Picture of backup here

So the restore procedure to the standard SQL Server creates all tables in the database and populates the data in these tables

In order to load these data Microsoft released a SqlPackage tool. You can run it directly or use d365fo.tools(link here). Both commands shown below

```powershell
#USE d365fo.tools
$StartTime = get-date 
Import-D365Bacpac -BacpacFile "J:\LCS\PreProd2022_05_24.bacpac" -ImportModeTier1 -NewDatabaseName PreProd2022_05_24_2
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 

#USE DIRECT SqlPackage CALL 
$StartTime = get-date 
cd C:\temp\
$fileExe = "C:\Temp\d365fo.tools\SqlPackage\SqlPackage.exe"
& $fileExe /a:import /sf:J:\MSSQL_BACKUP\pope_2022_05_16_small.bacpac /tsn:localhost /tdn:pope_2022_05_16_small_sp_ind  /p:RebuildIndexesOfflineForDataPhase=True /MaxParallelism:32 /p:DisableIndexesForDataPhase=FALSE
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 


```

In test I used the following backpac files

- A small file:  94MB backup size,  2.2 GB SQL database size
- A standard file: 2.5GB backup size,  24.7 GB SQL database size

Let's discuss what parameters may affect backpac restore process

### Fast hardware

On Azure VM you quite limeted in terms of disk performance. A standard configuration may have SSDs or HDDs disks, but their speed will be much slower compared to local PCEe drives(e.g. Samsung 840 PRO) 

I compared 2 different enviroments:

- Local PC with fast CPU and PCE SSD Intel core i9 10900 2.8GHz(up 4.8Gz)
- Standard development Azure VM D8v3 E5-2673 v4  (2.3Ghz) and 15HDDs

Local PC  may get a great advantage in terms of restore performance. The process is the following - you restore the backpac on local machine, after the restore create a backupof  SQL database and move it to the Azure file share(from where it may be copied to Azure VMs). Working with native SQL backup is quite fast operation comparing to backpac convertion

```powershell 
$StartTime = get-date 
Import-D365Bacpac -BacpacFile "C:\Temp\PreProd2022_05_24.bacpac" -ImportModeTier1 -NewDatabaseName PreProd2022_05_24_2  -DatabaseServer "SDS-WS83" -SqlUser denis -SqlPwd "Pass" 
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 
```

### Using Delayed durability

Delayed durability is a database option that allows to speed up certain database operation but database may stay in corrupted mode if server crash occured during the operation

For backpac restore on the the stages is creating the database structure that may be improved by using Delayed durability. The biggest issues with it is that it should be executed after DB creating, but SQLPackage.exe doesn't have an option to specify this. So currently I use this aproach only with manual restore. After ~3-5 min after executing SQLPackage.exe it creates a database and then I manually run the following command for the new created database.

```SQL
USE [master]
GO
ALTER DATABASE [PreProd2022_05_24_2] SET RECOVERY SIMPLE WITH NO_WAIT
GO
ALTER DATABASE [PreProd2022_05_24_2] SET DELAYED_DURABILITY = FORCED WITH NO_WAIT
GO
```

### RebuildIndexesOfflineForDataPhase 

RebuildIndexesOfflineForDataPhase=True is one of the SQLPackage flags that rebuild indexes offline after the data load procedure. On my tests I didn't notice noticible improvements with this flag, but probably for larger database it is someting keep in mind

### DisableIndexesForDataPhase

By default SQLPackage disables table indexes before loading the data end then enables them after the loading. For large tables it shoud improve the data load perfromance, but for for small tables you get 2 additional operations: disable and enable index.  /p:DisableIndexesForDataPhase=FALSE is changes this bahaviour,it just loads the data. For my test files it provides a significant performance boost

Test results

I put test results in the table below:

| Test type                                                    | Small file/Azure | Standard file/Azure | Small file/Local | Standard file/Local |
| ------------------------------------------------------------ | ---------------- | ------------------- | ---------------- | ------------------- |
| default                                                      | 1 hour, 16:24    | 3 hours, 51:36      | 21:33            | 1 hour, 23:50       |
| Disabled durability                                          | 46:35            | 3 hours, 18:36      | 20:11            | 1 hour, 20:12       |
| disabled durability, /p:RebuildIndexesOfflineForDataPhase=True |                  | 2 hours, 52:16      |                  | 1 hour, 07:09       |
| /p:RebuildIndexesOfflineForDataPhase=True /p:DisableIndexesForDataPhase=FALSE |                  | 2 hours, 23:19      | 21:01            | 51:15               |
|                                                              |                  |                     |                  |                     |



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
large file, all standard
Execution time was 3 hours, 51 minutes, 36 seconds

large file, durability enabled = true
Execution time was 3 hours, 18 minutes, 36 seconds

large file, durability enabled = true p:DisableIndexesForDataPhase=FALSE
Execution time was 2 hours, 23 minutes, 19 seconds

large file, durability enabled = true p:DisableIndexesForDataPhase=FALSE
Execution time was 2 hours, 52 minutes, 16 seconds

## Summary


As Another important question when you implement a solution like this: is how fast will be your integration. I wrote about sample steps for performance testing in the following post: [D365FO Performance. Periodic import of one million ledger journal lines](https://denistrunin.com/xpptools-fileintegledgerperf/) 

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.