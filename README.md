# About

(Summary of UNCLEBot and what it does)

(Invite link goes here)

# Commands and Features

## Search

## Search Namespacing

## FAQ

## DM Commands

(You'll need to use the ::dm-me command)
Turns out this is a limitation of the underlying discordjs library -- when a client starts, it doesn't load any of its DM channels into its cache

basically, when UNCLE reboots, UNCLE forgets all the DMs it was involved in, and can't manually fetch them. The workaround is to force UNCLE to DM you, which makes UNCLE become aware that your DM channel exists, enabling commands to be sent via DM

to my knowledge this is always how UNCLE worked, it's just that UNCLE has been online for so long that eventually UNCLE DMs you something, which is why this issue wasn't caught previously

# Deploying your own instance of UNCLE

(How to set up in Discord's dev portal)
(As a bonus, you can add your own player LCPs to Uncle's data directory)

