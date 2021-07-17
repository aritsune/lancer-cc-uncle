module.exports = function stressDamage(lowest_dice_rolled, remaining_stress) {
  let out = `Lowest Dice Rolled: ${lowest_dice_rolled} | Remaining Stress: ${remaining_stress}\n\n`
  if (remaining_stress <= 0) return "Remaining stress was <= 0, which is invalid."
  switch(lowest_dice_rolled) {
    case 6:
    case 5:
      out += "**EMERGENCY SHUNT:** Your mech’s cooling systems manage to contain the increasing heat; however, your mech becomes IMPAIRED until the end of your next turn."
      break
    case 4:
    case 3:
    case 2:
      out += `**DESTABILIZED POWER PLANT:** The power plant becomes unstable, beginning to eject jets of plasma. Your mech becomes EXPOSED, taking double kinetic, energy, and explosive damage until the status is cleared.`
      break
    case 1:
      if (remaining_stress >= 3) out += "**MELTDOWN:** Your mech becomes EXPOSED."
      else if (remaining_stress === 2) out += "**MELTDOWN:** Roll an ENGINEERING check. On a success, your mech is EXPOSED; on a failure, it suffers a reactor meltdown after 1d6 of your turns (rolled by the GM). A reactor meltdown can be prevented by retrying the ENGINEERING check as a free action."
      else if (remaining_stress === 1) out += "**MELTDOWN:** Your mech suffers a reactor meltdown at the end of your next turn."
      out += "\n\nIf you rolled multiple 1s, this becomes an **IRREVERSIBLE MELTDOWN** -- the mech suffers a reactor meltdown no matter how much stress it has left."
      break
    default:
      return `${lowest_dice_rolled} isn't a valid value on a d6.`
  }
  return out
}