---
title: "Comparing D365FO development VMs performance(VS2017)"
date: "2020-10-21T20:12:03.284Z"
tags: ["Development", "Performance"]
path: "/devvm-perfv13"
featuredImage: "./logo.png"
excerpt: "Comparing the performance of 4 D365FO development VM configurations with Visual studio"
---

Starting from PU37 Microsoft has changed Dynamics 365 Finance and Operation development environment from Visual Studio 2015 to VS2017. This post is an updated version of my [previous one for VS2015](https://denistrunin.com/devvm-perfv10/), where I try to compare the performance of 4 development configurations with the new VS2017 version.

I have chosen the following VMs:

- Local Hyper-V Image
- Standard VM based on 3 HDD disks - this is a default Development setting in LCS
- Azure VM based on Premium SSD disks
- Azure VM based on 15 HDD disks - changed via LCS Advanced settings

Detail specifications of these VMs:

| Name                   | Local                                       | SSD                                                 | HDD15                                                 | HDD3                                                |
| ---------------------- | ------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| VM Type                | Local Hyper-V Image                         | Standard D8s v3                                     | Standard D12 v2                                       | Standard D12 v2                                     |
| CPU                    | Core i7-8700 3.2GHz, 6 cores, 24 GiB memory | Xeon Platinum 8171M 2.10GHz, 8 vcpus, 32 GiB memory | Xeon Platinum 8272CL, 2.60GHz, 4 vcpus, 28 GiB memory | Xeon Platinum 8171M 2.10GHz, 4 vcpus, 28 GiB memory |
| Storage                | Samsung 970(more than 100k IOPS)            | 3 premium disks 512GB (2300 IOPS) + build           | 15 HDD disks 32GB (500 IOPS)+ build                   | 3 HDD disks 512GB (500 IOPS)+ build                 |
| Run cost               | Box for run 3 VMs - around 1.5k$            | 0.75$ per hour                                      | 0.52$ per hour                                        | 0.52$ per hour                                      |
| Storage cost (monthly) | 0                                           | 219 USD                                             | 24 USD                                                | 65 USD                                              |

One thing to note: in Azure the [performance of SSD disks](https://docs.microsoft.com/en-us/azure/virtual-machines/disks-types#disk-size-1) depends on the disk size and it is different from HDD disk performance that is always 500 IOPS.

![DiskSpeedSSD](DiskSpeedSSD.png)

That means that in Azure world SSD disk is not always better than HDD. It is also tricky to do any tests with an SSD because they have [disk bursting](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/disk-bursting) that can temporaly increase disk IOPS to 3500 up to 30 minutes.
I did some testing with 16HDDs(500 IOPS) and 3 SSDs 512GB, 2300IOPS max( + Build 26GB ) and got the following results: for 16HDD you will get 8000 stable IOPS, for 3 SSD you get 7100 stable IOPS and Bursting can temporarily add 3500 IOPS.

![IOPSTesting](IOPSTesting.png)

## System version and initial setup

Both 4 VMs have used the same D365FO version: "Finance and Operations - Develop (10.0.13 with Platform update 37)". After installation I disabled the following services:

- Microsoft Dynamics 365 Unified Operations: Batch Management Service

- Microsoft Dynamics 365 Unified Operations: Data Import Export Framework Service

- Management Reporter 2012 Process Service

and added D365 Defender Rules:

```powershell
Install-Module -Name d365fo.tools
Add-D365WindowsDefenderRules
```

## Overall system performance tests

First, let's compare overall system performance by running a full compile and full DB sync. They are not frequent operations for Dev machines, but they are very resource-intensive and it allows us to find out VMs overall capacity.

For the compile task I got the following results:

![Full compile time](FullCompileTime.png)

The compile times are longer than in previous test with VS2015 and 10.0 version.

Next test is a database synchronize:

![Full Sync time](FullSyncTime.png)

Synchronize operation is an IO and CPU-intensive task. Local VM has a more powerful IO system, and a more powerful CPU, that explains a better result. SSD VM performed better compared to HDD in this test due to faster disks. And again for all VMs there is ~30% performance decrease compared to VS2015.

## Daily task tests

To test performance for more frequent developer tasks I chose 2 tasks: time to hit breakpoint and time to display 'Hello world' message from the job. In AX2012 both these tasks have a near-zero execution time, so you don't need to wait.

### Time to hit breakpoint test

Before the test I opened the D365FO main screen, to warm up the system cache.

To prepare for this test I switched off 'Load symbols for items in the solution'. Then I opened AOT, searched for a **SalesTable** form and added it into the new project and marked the form as a startup object. After that I opened the code and added a new breakpoint to the **init()** method.

Time in this test is the time between I pressed **Start** and the time when the breakpoint was hit.

![Breakpoint image](HitTheBreakpoint.jpg)

For HDD03 VM this test initially failed(I got a Timeout message).

![VSTimeout](VSTimeout.png)

Two tests were performed to see how the cache would change this time.

![TimeToHitBreakpoint results](TimeToHitBreakpoint.png)

The result probably depends on IO speed.

### Hello world test

This test was performed straight after the breakpoint test, but I restarted Visual Studio. In this test, I created a new project and added a Runnable class with the following code

```csharp
info("Hello world");  
```

On the second run, I changed this text to "Hello world2". On the Third run I didn't change the text, just ran the same job.

I measured the time between pressing Start and the time when the message displayed in the browser.

Here are the results:

![Test](HelloWorldTest.png)

The problem is that for HDD based machines the test failed in the first attempt, Visual studio just hung. The solution was to kill the process and restart it again(that explained that HDD "First times" are better)

![HandWhenRunJob](HandWhenRunJob.png)

## Update 10.0.37 local

Recently I made an upgrade for my local PC and tested the performance of the local 10.0.37 VM with VS2022. 
I upgraded to a Ryzen 7 7700X CPU(not the fastest, but close to the top CPU https://www.cpubenchmark.net/singleThread.html), and a Samsung 990PRO SSD(more than 1 million IOPS). The results are the following:

- Full sync for the database: around 3 minutes
- Recompile the project: almost instant (1.5 seconds)
- Refresh the simple form (like CustGroup) after recompile: 25 seconds
- Refresh the complex form (SalesTable) after recompile: 35 seconds
- Put a breakpoint to SalesTable.init and attach to process: almost instant (2-3 seconds)

Local VMs may not be the most convenient options, but if you write a lot of X++ code(with change/test/fix cycles), they are worth considering.

To increase response time even more, enable Preload feature https://abhimantiwari.github.io/blog/Application-Initialization/ (thanks **Huber Gomez Hernandez** for this advice)

### Update 2024-10-17

Make sure you disable the "Build metadata cache when AOS starts" parameter in the  **System parameters** form(System administrator → Setup → System parameters)

https://www.linkedin.com/pulse/boost-your-x-development-vm-performance-2x-denis-trunin-krowc/

Enabling disk cache also adds some improvements. With Read it takes about 60 seconds to refresh the browser after rebuild 

![](DiskCache.png)

## Conclusion

Let's summarize the current recommendations based on these tests for Visual Studio 2017 D365FO development environment and what to do if it is slow:

- If you want maximum performance and can buy a new hardware(and now you can buy a PC that has 10-20% more [speed](https://www.cpubenchmark.net/singleThread.html) than mine), Local VM is the best choice, but this VM is hard to manage.

- Standard Development Environment from LCS(with the default of 3 HHD disks) is the slowest and constantly hangs. If you can control the Environment creation, never use it and always change the number of disks(15 32GB HDD are cheaper and faster).

- HDD15 VM with ..V5 CPUs is the best choice in terms of price/performance. It is a little bit slower than SSD based VM, but the storage price(that should be paid even if VM is deallocated) is almost 10 times cheaper(24 vs 220 USD)

I will also try to repeat the same tests after the next D365FO release, it will be interesting to compare the progress in this area. Any comments are welcome.
