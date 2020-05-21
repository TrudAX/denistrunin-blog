



Initial setup

so here our project setup, I created 2 branches one for our internal development and testing(Trunk - Main) and one for user testing - TEST. Test is mapped to some temporary folder 

![](InitialTFSSetup.png)



## Why my code doesn't compile

let's do our first modification, Add a new EDT **EDT_FieldA** and a new Field based on this type to **CustGroup** table

![](ModA.png)

Commit our changes

![](CommitA.png)

Then let's do our second modification - A new field to the same **CustGroup** table based on a new EDT **EDT_FieldB**

![](ModB.png)

and commit it to our **Main** branch as **ProjectB**

These two modifications are logically not linked, so after the testing we can decide to move **ProjectB** only to the user test environment. It is a typical situation in AX2012, you just export the project to XPO from DEV and load it into TEST(during the import you compare XPO and transfer only relevant changes)

But the trick is you can't use this approach in Dynamics 365 Finance and Operations. 

A typical mistake is to use **Selected changesets** merge to do this. Let see how it works:

You run a Merge command and choose **Selected changesets** 

![](SelectedChangeSet.png) 

then you select only **ProjectB** assuming that only changes from **ProjectB** will be included

![](SelectChangeSet.png)

but the result will be not expected - you will also transfer a new FieldA and it refers to EDT that doesn't exists in TEST branch. So you will get a compile error when you try to Build(and that is not a worst scenario)  

![](MergeResults.png)

## Why my test system doesn't work

Let's consider another example - you are developing some complex modification(**Project1**) and a part of this modification is a new validation on Sales table

![](Project1.png)

Another developer is developed in the same branch a simple modification just to provide some default values(Project2) for the SalesTable

![](Project2.png)

**Project2** is simple to test and after testing you decided to move to it user testing - TEST branch. Again this is a typical valid scenario in AX2009, AX2012, we often don't care about other people modifications, we just use XPO and compare the code during import.

You run selected changeset transfer and choose **Project2** only 

![](MergeSelected2.png)

As a result you will get a file that contains a part or **Project1**. 

![](Merge2.png)

This probably creates a unexpected new validation on TEST and your users will not be able to create Sales orders due to this

## Where is my code

Lets continue with the example above. Let's consider that it is your lucky day and you noticed that you added unwanted code from **Project1** to the TEST version before it's being deployed to users.

You open the class and delete the code related to **Project1** from it. A typical AX2012 operation. 

Then after some time you decided to finally transfer **Project1** to TEST. 

![](MergeSelected3.png)

After a successful merge your code related to **Project1** will not appear. You lost it! And in this case you 

![](MergeResults3.png)

## Microsoft recommendations 

The basic advice from Microsoft is the following:

> Start with the main only branching strategy, [branch strategically](https://docs.microsoft.com/en-us/azure/devops/repos/tfvc/branch-strategically?view=azure-devops) and adopt other strategies to evolve into more complex strategies as needed.

To achieve this you need to work in sprints(for example 1 release per week). 

It is a high change that sometimes you need an emergency fixes(that can't wait for a week) 

In this case you restore a new temporary branch from the last build, implement a fix in this temporary branch and merge changes back to Main before the next release(it will be a **Release isolation strategy**). 

## Conclusion 

Team Foundation Version Control(**TFVC**) is a quite basic system comparing to Git. The main confusion that people have - changeset in **TFVC** are not the changes, but a whole object.

If you use old AX approach("Merge selected changesets" in random order) with D365FO Team Foundation Version Control(**TFVC**) system you may face problems. You may get compile errors, transfer unwanted code and lost changes. 

None of the recommended strategies allow "Merge selected changesets", you should always work with a full branch.  https://docs.microsoft.com/en-us/azure/devops/repos/tfvc/branching-strategies-with-tfvc?view=azure-devops



