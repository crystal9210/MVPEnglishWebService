export class Email {
    constructor(private readonly value: string) {
        if (!Email.validate(value)) {
            throw new Error("Invalid email address");
        }
    }

    static validate(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    getValue(): string {
        return this.value
    }

    equals(other: Email): boolean {
        return this.value === other.value;

    }
}
