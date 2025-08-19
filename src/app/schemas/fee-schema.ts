export interface Fee {
    name: string,
    category: string,
    basicFee: number,
    variableFee: number,
    checked?: boolean
}