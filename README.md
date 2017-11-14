# homebridge-sinope

Homebridge sinope is an homebridge plugin for Sinope baseboard thermostats.

For more information about Sinope thermostats, visit http://www.sinopetech.com

Sinope thermostats run along with a web application called neviweb which is basically a responsive web application that does ajax calls to a web api.

homebridge-sinope uses these web api so that you can interact with siri as an alternative to neviweb.

`Notes: This is still a beta version.`

```Todos: Add lint, tests, refactor

Improvements:
- Instead of login every time on the neviweb platform when extracting handling
characteristic, we should reuse the session-id by pinging the gateway.
If there is a 200 response, reuse the session-id, otherwise retry login.
- Mecanism to use the same device object for all it's characteristic.```
