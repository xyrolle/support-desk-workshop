#!/bin/sh
# Blocks commands matched in .cursor/hooks.json. Pushing and adding
# dependencies stay a human decision in this project.
cat <<'JSON'
{
  "permission": "deny",
  "user_message": "Blocked by .cursor/hooks.json: pushing and installing packages need a human.",
  "agent_message": "This command is blocked in this project. Stop and ask the user to run it if it is really needed."
}
JSON
