# Mount - Prediction

Removes ping tax related to mounts such as `skill -> mount` and `unmount -> skill`

Also acts as a way to change your mount client side

# Note

The default mount is the flight suit mount, this is normal and can be easily changed. Please read.

[+] New feature `mp sudo` with sudo activated, your customMount will be which ever mount you used last, useful for those that didn't like the whole "only seeing one mount" thing

Note that it is still in testing, so there may be bugs, if you wish to have it permanently on change `"sudo" : false,` to `"sudo" : true,` in the config.json, there is also a command to toggle it on/off in game

# Requirements
[tera-game-state](https://github.com/hackerman-caali/tera-game-state) (if you are using [caali's](https://discord.gg/maqBmJV) proxy you already have this by default!)

If you still have problems, make sure the folder is called `tera-game-state` and not `tera-game-state-master`

# Commands
Note, if using the commands in the proxy channel or `/8`, ignore the `!` prefix

Command | Argument(s) | Example | Description
---|---|---|---
**!mp** | on, off | !mp on| Turns the module either on or off (on by default)
**!mp** | unmount | !mp unmount| Forcefully dismounts you, can be used if something bugs out and you are unable to
**!mp** | set | !mp set 261| Used to set the type of mount you want your predicted mount to be(list of id's can be found below)
**!mp** | sudo | !mp sudo | Sudo feature, basically it sets your custom mount to which ever mount you used last

# Mount list

https://docs.google.com/spreadsheets/d/1ThLlpatnxwenbxnQiTOtxjoYqGVEulWdWE5nrKA_-6U/edit?usp=sharing

# Warning
DO NOT ATTEMPT TO FLY WHEN USING A GROUND MOUNT SERVER SIDE, YOU WILL TELEPORT

# Known bugs:
Sometimes mounting right after combat can use your actual mount instead of the one set by the module

Mounting directly after using skills that are emulated incorrectly (length of the skill too short) can cause you to falsely be mounted client side (fixed by simply using your mount again)