# Mount - Prediction

Think skill prediction, but for mounts... mount prediction, clever name 10/10 creative ign

# Usage
The commands are a wip aka I'm too lazy to make them all one nice command like I should, instead here we have

`/8 command` simply put, use them in the proxy chat channel or `!command` if outside of proxy channel
(replacing command with what ever command your using)

`mptoggle` - turns the module off (very revolutionary)

`setmount #` - sets the mount that you will see when using any mount e.g `setmount 261` will use the flight suit mount

`unmount` - incase everything goes to shit this will unmount you client side (used to combat a current bug mainly, when using non-flying mounts as your mount id while you are using a flying mount)

`msi` - logs any C_START_SKILL skill id and prints it in the proxy window, if your mount isn't being predicted you can use this to log using the mount and add it to the list(make sure to not add 132108866 or 132108865, these are flying mount skills)

once I stop being lazy, I want to make commands to be like, `mp on/off/set/log`

# Mount list

https://docs.google.com/spreadsheets/d/1ThLlpatnxwenbxnQiTOtxjoYqGVEulWdWE5nrKA_-6U/edit?usp=sharing

# Warning
DO NOT ATTEMPT TO FLY WHEN USING A GROUND MOUNT SERVER SIDE, YOU WILL TELEPORT

# Known bugs:
Sometimes mounting right after combat can use your actual mount instead of the one set by `setmount`
this seems to happen cause the server lets the client mount as soon as the server sees it out of combat and before the client sees its self as out of combat