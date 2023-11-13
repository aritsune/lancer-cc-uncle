export function structureDamage(lowest_dice_rolled, remaining_structure) {
  let out = `Lowest Dice Rolled: ${lowest_dice_rolled} | Remaining Structure: ${remaining_structure}\n\n`
  if (remaining_structure <= 0) return "Remaining structure was <= 0, which is invalid."
  switch(lowest_dice_rolled) {
    case 6:
    case 5:
      out += "**GLANCING BLOW:** Mech is impaired until the end of its next turn."
      break
    case 4:
    case 3:
    case 2:
      out += `**SYSTEM TRAUMA:** Roll 1d6. On 1-3, all weapons on one mount (of choice) are destroyed. On 4-6, one system (of choice) is destroyed.
(Weapons or systems with no LIMITED charges are not valid choices.)
If there are no valid weapons, destroy a system; if there are no valid systems, destroy a weapon.
If there are no valid weapons or systems, this becomes a Direct Hit instead.
`
      break
    case 1:
      if (remaining_structure >= 3) out += "**DIRECT HIT:** Mech is STUNNED until the end of its next turn."
      else if (remaining_structure === 2) out += "**DIRECT HIT:** Roll a HULL check. On a success, your mech is STUNNED until the end of your next turn. On a failure, your mech is destroyed."
      else if (remaining_structure === 1) out += "**DIRECT HIT:** Your mech is destroyed."
      out += "\n\nIf you rolled multiple 1s, this becomes a **CRUSHING HIT** -- the mech is destroyed regardless of how much structure it has left."
      break
    default:
      return `${lowest_dice_rolled} isn't a valid value on a d6.`
  }
  return out
}