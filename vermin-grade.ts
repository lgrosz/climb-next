class VerminParseGradeError extends Error {
    constructor(message: string = "Failed to parse grade") {
        super(message);
        this.name = "VerminParseGradeError";
    }
}

export default class VerminGrade {
    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    public static fromString(s: string): VerminGrade {
        if (!s.startsWith("V")) {
            throw new VerminParseGradeError();
        }

        const valueString = s.substring(1);
        const value = parseInt(valueString, 10);

        if (isNaN(value)) {
            throw new VerminParseGradeError();
        }

        return new VerminGrade(value);
    }

    public static slashString(grades: VerminGrade[]): string {
        if (grades.length === 0) {
            return ""
        }

        const first = grades[0].toString()
        const remaining = grades.slice(1).map(grade => grade.getValue().toString())

        return [first, ...remaining].join("/")
    }

    public getValue(): number {
        return this.value;
    }

    public toString(): string {
        return `V${this.value}`;
    }
}
