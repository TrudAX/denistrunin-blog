





disable 

Microsoft Dynamics 365 Unified Operations: Batch Management Service

Microsoft Dynamics 365 Unified Operations: Data Import Export Framework Service

Management Reporter 2012 Process Service



Full app compile

local - 28min

SSD - 59 min

HDD -64 min



Full app sync

Local - 3min, 38sec

SSD - 5min, 35sec

HDD - 7min 15sec



The next test is time to hit breakpoint

To prepare for this I switched off Load symbols for items in the solution. Then Open AOT, Locate SalesTable form and add it into the new project. Mark the form as a startup object. Open the code and add a new breapoint to the init() method 

Created a new project with the SalesTable form, set breakpoint 

Local - 

SSD - First run st - 04.4 end- 0.51.1, Second 01.0.3, 01.18.5

HDD - first 09.4 ; end 03.03.8??





test hello world

Create a new project and add a Runnable class with 

Info("Hello world");  

In this case I measured the time between pressing the start Button to Display "Hello world" in the browser

Local - 

SSD - First run st 5.3  end 41.6, Second 58.6 end 01.08

HDD - 03.5 end 38.6, 50.2 end 01.01.5





