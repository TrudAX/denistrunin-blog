---
title: "Comparing D365FO development VMs performance(VS2017)"
date: "2020-10-20T20:12:03.284Z"
tags: ["Development", "Performance"]
path: "/devvm-perfv13"
featuredImage: "./logo.png"
excerpt: "Comparing the performance of 4 VM configurations for D365FO development with Visual studio 2017"
---

Starting from PU37 Microsoft has changed Dynamics 365 Finance and Operation development from Visual Studio 2015 to VS2017. This post is an updated version of my [previous one for VS2015](https://denistrunin.com/devvm-perfv10/), I try to compare the performance of 4 development configurations with the new VS2017 version.

I have chosen the following VMs: 

- Local Hyper-V Image
- Azure VM based on Premium SSD disks, 
- Azure VM based on 15 HDD disks - changed via LCS Advanced settings
- Standard VM based on 3 HDD disks - this is a default setting in LCS 

There are detail specifications of these VMs:

| Name                   | Local                                       | SSD                                                 | HDD15                                                 | HDD3                                                |
| ---------------------- | ------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| VM Type                | Local Hyper-V Image                         | Standard D8s v3                                     | Standard D12 v2                                       | Standard D12 v2                                     |
| CPU                    | Core i7-8700 3.2GHz, 6 cores, 24 GiB memory | Xeon Platinum 8171M 2.10GHz, 8 vcpus, 32 GiB memory | Xeon Platinum 8272CL, 2.60GHz, 4 vcpus, 28 GiB memory | Xeon Platinum 8171M 2.10GHz, 4 vcpus, 28 GiB memory |
| Storage                | Samsung 970(more than 100k IOPS)            | 3 premium disks 512GB (2300 IOPS) + build           | 15 HDD disks 32GB (500 IOPS)+ build                   | 3 HDD disks 512GB (500 IOPS)+ build                 |
| Run cost               | Box for run 3 VMs - around 1.5k$            | 0.75$ per hour                                      | 0.52$ per hour                                        | 0.52$ per hour                                      |
| Storage cost (monthly) | 0                                           | 219 USD                                             | 24 USD                                                | 65 USD                                              |

One thing to note: in Azure the [performance of SSD disks](https://docs.microsoft.com/en-us/azure/virtual-machines/disks-types#disk-size-1) depends on the disk size and it is different from HDD performance that is always 500 IOPS.

![](DiskSpeedSSD.png)


Both 4 VMs have used the same D365FO version - Finance and Operations - Develop (10.0.13 with Platform update 37). After installation I disabled the following services:

- Microsoft Dynamics 365 Unified Operations: Batch Management Service

- Microsoft Dynamics 365 Unified Operations: Data Import Export Framework Service

- Management Reporter 2012 Process Service

Added D365 Defender Rules:

```powershell
Install-Module -Name d365fo.tools
Add-D365WindowsDefenderRules
```

## Overall system performance tests

First, let's compare overall system performance by running a full compile and full DB sync. They are not frequent operations for Dev machines, but they are very resource-intensive and it allows us to find out VMs overall capacity.

For the compile task I got the following results:

![Full compile time](FullCompileTime.png)

The times are much longer than in previous VS2015.

Next test is a database synchronize:

![Full Sync time](FullSyncTime.png)

Synchronize operation is IO and CPU-intensive task. Local VM has a more powerful IO system, and a more powerful CPU, that explains the better result. SSD VM performed better compared to HDD in this test due to faster disks. And again ~ 30% performance decrease compared to VS2015.

## Daily task tests

In order to test performance for more frequent developer tasks I chose 2 tasks - time to hit breakpoint and time to display 'Hello world' message from the job. In AX2012 both these tasks have near-zero execution time, you don't need to wait.

### Time to hit breakpoint test

Before the test I opened the AX main screen, to warm the system cache.

To prepare for this test I switched off 'Load symbols for items in the solution'. Then I opened AOT, searched for **SalesTable** form and added it into the new project. Marked the form as a startup object. After that opened the code and added a new breakpoint to the **init()** method.

Time in this test - is the time between I pressed **Start** and the time when the breakpoint was hit.

![Breakpoint image](HitTheBreakpoint.jpg)

Two tests were performed to see how the cache changes this time

![TimeToHitBreakpoint results](TimeToHitBreakpoint.png)

HDD VM was very slow in this test. You need to wait almost 5 minutes to see your first breakpoint! SSD and Local VMs first run was the same, but the second run Local VM was faster.

### Hello world test

This test was performed straight after the breakpoint test, but I restarted Visual Studio. In this test I created a new project and added a Runnable class with the following code

```csharp
info("Hello world");  
```

On the second run, I changed this test to "Hello world2". On the Third run I didn't change the text, just run the same job.

I measured the time between pressing Start and the time when the message displayed in the browser. 

Here are the results:

![Test](HelloWorldTest.png)

You need to wait almost a minute for the HDD to see the results of a simple job. For Local and SSD it is 70% faster. Local VM also executed the job faster if it was not changed - probably due to a high single-core CPU speed(but you still need to wait 7 second, it is not instant)

## Conclusion

For D365FO typical development actions can take longer time comparing to AX2012 where most operations were near-instant. But, by choosing a proper hardware for Development VM you can compensate this time to some extent. There is no right answer what to choose, you need to consider your situation:

- If you want maximum performance and can buy a new hardware(and now you can buy a PC that has 10-20% more [speed](https://www.cpubenchmark.net/singleThread.html) than mine) - Local VM is the best choice, but this VM is hard to manage.
- Azure Premium disks VM(SSD) is the best choice if you can spend a little bit more for the cloud. It costs 6$ more per day(10 hours) than HDD, but provides a noticeable performance boost. But you need to pay for the storage - if you use this VM only sometimes it can be expensive.
- Azure standard disks(HDD) VM is the most commonly used configuration, but according to my tests, it is not the best choice for an active project. If you just do a simple math(typical consulting rate is 180$ per hour(3$ per minute), 5 minutes wait for the first breakpoint will cost you more than the daily price difference with SSD VM)

I also will try to repeat the same tests after the next D365FO release, it will be interesting to compare the progress in this area.
