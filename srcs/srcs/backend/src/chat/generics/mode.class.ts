export class ModeService {

    modeIsSet(num: number, bit_to_check: number): boolean {
      if (num & bit_to_check)
          return true;
      return false;
    }

    setMode(num: number, bit_to_set: number): number {
        num |= bit_to_set;
		return num;
    }
  
    unsetMode(num: number, bit_to_unset: number): number {
        num &= ~bit_to_unset;
		return num;
    }
}