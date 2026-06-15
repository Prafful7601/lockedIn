' Launches the LockedIn desktop app with NO console window.
' (Run LockedIn.bat once first if .next isn't built yet.)
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
proj = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = proj
electron = proj & "\node_modules\electron\dist\electron.exe"
sh.Run """" & electron & """ """ & proj & """", 0, False
