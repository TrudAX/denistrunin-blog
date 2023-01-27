---
title: "Improve the speed for bacpac database restore from Tier2 to Tier1"
date: "2023-01-17T22:12:03.284Z"
tags: ["ALM"]
path: "/performance-restoretier2"
featuredImage: "./logo.png"
excerpt: "The blog post tests various options for restoring bacpac files on local SQL Server "
---

Working with the real data can be vital for a development process, espesially during the Go-Live and Support phase. One of the issues is the different database format on development VMs, that are using SQL Server and UAT/PROD enviroments that are using SQL Azure as database.

One of the workaroud is to use debugger on Tier2(link here), but in this article we consider a restore backpack from a Tier2 to Tier1 enviroment.

**SQL backpac** format is a zip file that contains tables data in text format. If you change .backpac extension to .zip and open it in archive tool you see someting like that:

![Backpac](ZipFileStructure.png)

So the backpac restore procedure to the SQL Server creates all tables in the database and populates the data in these tables.

In order to load the data Microsoft released a [SqlPackage](https://learn.microsoft.com/en-us/sql/tools/sqlpackage/sqlpackage?view=sql-server-ver16) tool. You can run it directly or use [d365fo.tools](https://github.com/d365collaborative/d365fo.tools). Both commands shown below:

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

Let's discuss what parameters may be used to change backpac restore execution time:

### Get the fast hardware

Azure VM are quite limited in terms of disk performance. A standard configuration may have SSDs or HDDs disks, but their speed will be much slower compared to local PCEe drives(e.g. Samsung 870 PRO) 

The process is the following: you restore the backpac on local machine, after the restore create a backup of  SQL database, move it to the Azure file share and copy-restore this SQL backup on the cloud Azure VM. Working with native SQL backup is quite fast operation comparing to backpac convertion and Local PC may provide a great advantage in terms of the restore time. The sample code for this is the following:

```powershell 
$StartTime = get-date 
Import-D365Bacpac -BacpacFile "C:\Temp\PreProd2022_05_24.bacpac" -ImportModeTier1 -NewDatabaseName PreProd2022_05_24_2  -DatabaseServer "SDS-WS83" -SqlUser denis -SqlPwd "Pass" 
$RunTime = New-TimeSpan -Start $StartTime -End (get-date) 
WRITE-HOST "Execution time was $($RunTime.Hours) hours, $($RunTime.Minutes) minutes, $($RunTime.Seconds) seconds" 
```

### Use Delayed durability database option

Delayed durability is a database option that allows to speed up certain database operation but database may stay in corrupted mode if server crashed during the operation. D365FO database contains the huge number of objects and the time for DB structure creation may be improved by using the Delayed durability flag. 

The main problem is that it can be enable only after the DB is created, but **SQLPackage** doesn't have an option to automate this. So currently I use this aproach only with manual step. In ~3-5 min after executing **SQLPackage**.exe it creates a database and then I manually run the following command for the new created database.

```SQL
USE [master]
GO
ALTER DATABASE [PreProd2022_05_24_2] SET RECOVERY SIMPLE WITH NO_WAIT
GO
ALTER DATABASE [PreProd2022_05_24_2] SET DELAYED_DURABILITY = FORCED WITH NO_WAIT
GO
```

### Use RebuildIndexesOfflineForDataPhase switch

**RebuildIndexesOfflineForDataPhase=True** is one of the **SQLPackage** performance flags that rebuilds indexes with offline mode after the data load procedure. On my tests I didn't notice any improvements with this flag, but probably for larger database it is someting keep in mind.

### Use DisableIndexesForDataPhase switch

By default **SQLPackage** disables table indexes before load the data and then enables them after the load. For large tables it shoud improve the data load perfromance, but for small tables you get 2 additional steps: disable and enable indexes.  **/p:DisableIndexesForDataPhase=FALSE** flag changes this bahaviour,it just loads the data. For my test files it provides a significant performance boost

## Test results

In test I used the following backpac files

- **A small file**:  94MB backpac size,  2.2 GB SQL Server database size
- **A standard file**: 2.5GB backpac size,  24.7 GB SQL Server database size

I compared 2 different enviroments:

- A Local PC with fast CPU and PCE SSD Intel core i9 10900 2.8GHz(up 4.8Gz)
- A Standard development Azure VM D8v3 E5-2673 v4  (2.3Ghz) and 15HDDs

| Test type                                                    | Small file/Azure | Standard file/Azure | Small file/Local | Standard file/Local |
| ------------------------------------------------------------ | ---------------- | ------------------- | ---------------- | ------------------- |
| Default SQLPackage parameters                                | 1 hour, 16:24    | 3 hours, 51:36      | 21:33            | 1 hour, 23:50       |
| Disabled durability                                          | 46:35            | 3 hours, 18:36      | 20:11            | 1 hour, 20:12       |
| disabled durability, /p:RebuildIndexesOfflineForDataPhase=True |                  | 2 hours, 52:16      |                  | 1 hour, 07:09       |
| /p:DisableIndexesForDataPhase=FALSE                          |                  | 2 hours, 23:19      | 21:01            | 51:15               |
|                                                              |                  |                     |                  |                     |

For the small file the restore times varied from one hour to 20 minutes. What is interesting here for a fast hardware the restore time almost independand from various switches. For slow disk systems(standard DEV VM) Delayed durability provides some significant boost. Also for considetable small amount of data it is worth to consider /p:DisableIndexesForDataPhase=FALSE flag

## Summary

I described different options for the backpac restore process. Every database size is unique, but this should be a good place to start if you want to optimise the restore time for your project. For example a "standard" size file may be restored in 4hours or just 1 hour depending on the different config. 

What is also important is to have the process that covers the need of your project. For exampe you may have a standard automated restore process that takes 4h and have an "emergency" process that requires some interactions(e.g. Delayed durability, manually delete large log tables from backpac before the restore, etc...) that can be done in 1h.

I hope you find this information useful. As always, if you see any improvements, suggestions or have some questions about this work don't hesitate to contact me.