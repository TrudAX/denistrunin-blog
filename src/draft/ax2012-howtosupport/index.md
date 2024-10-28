How to support your legacy Dynamics AX system(AX2012, AX2009, AX40)

If you inherit or using a legacy Dynamics AX system and upgrade is not coming you probably need a find a way to maintain this system in efficient way. In this post I will try to provide a detailed step by step instruction how to do this. Most of the topics refer to my previous articles, this is just all-in-one guide.



## Perform technical audit

Technical audit consists of two main parts. First you ask your users their main pain points in a certain format and try to resolve 

Then there are Best practices how the system should be configured, you validate all this and make adjustments

I wrote many acticles about this, the mains are [Dynamics AX performance audit](https://denistrunin.com/performance-audit/) regarding what should be checked and how and  [How to manage a Dynamics AX performance optimization project](https://denistrunin.com/performance-projmanage/) how to organize this project (the key factor - upper management should be involved, as you need to do changes, and for legacy systems someone should accept the risk of doing that )

As the end result you should have a properly functional system with some acceptable parameters for users that configures according to best practices.

## Perform periodic system monitoring

After system enters a stable state it is quite important to perform a periodic system monitoring to quickly identify and fix potential problems. In Windows there are huge number of counters to monitor, but it is important that monitoring leads to some actions, rather than monitoring itself. Take for example most typical counter - CPU load. If you  



## Developing new integrations

 It may happen that you need to develop a new integration with some systems. Most of the in-build AX modules (like AIF) becomeobsolete, so I suggest using the  External integration module. I shared code for D365FO, but it is fully X++ based, so can be with some restrictions reused on lower versions

For inbound flow it will be something like importing files from the shared directory, for outbound - periodic and event based exports to the files. It may be also combined with some No-Code tools, setup to take files from the directory and send to external services. 

## Maintaining Windows and SQL Server versions






https://www.linkedin.com/pulse/how-install-ax-2012-r3-ssrs-extensions-sql-2022-you-really-nosov-dcvzc/






## Performing data cleanup





## Summary 

I described key concept of optimising and maintaining Dynamics AX system, hope you may find this useful. Feel free to post any questions or share your support experience.





