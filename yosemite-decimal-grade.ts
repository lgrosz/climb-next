class YosemiteDecimalParseGradeError extends Error {
    constructor(message: string = "Failed to parse YosemiteDecimal grade") {
        super(message);
        this.name = "YosemiteDecimalParseGradeError";
    }
}

enum Modifier {
    A = "a",
    B = "b",
    C = "c",
    D = "d"
}

export default class YosemiteDecimalGrade {
    private value: number;
    private modifier: Modifier | null;

    private static readonly validGrades = /^5\.(\d+)([abcd]?)$/;

    constructor(value: number, modifier: Modifier | null) {
        if (value < 1) {
            throw new YosemiteDecimalParseGradeError("Invalid grade value");
        }

        if (value < 10 && modifier !== null) {
            throw new YosemiteDecimalParseGradeError("Grades below 10 cannot have a modifier");
        }

        if (value >= 10 && modifier === null) {
            throw new YosemiteDecimalParseGradeError("Grades 10 and above must have a modifier");
        }

        this.value = value;
        this.modifier = modifier;
    }

    public static fromString(s: string): YosemiteDecimalGrade {
        const match = s.match(YosemiteDecimalGrade.validGrades);

        if (!match) {
            throw new YosemiteDecimalParseGradeError();
        }

        const value = parseInt(match[1], 10);
        const modifier: Modifier | null = match[2] ? (match[2] as Modifier) : null;

        if (value < 6 && modifier !== null) {
            throw new YosemiteDecimalParseGradeError("Grades below 10 cannot have a modifier");
        }

        if (value >= 6 && modifier === null) {
            throw new YosemiteDecimalParseGradeError("Grades 10 and above must have a modifier");
        }

        return new YosemiteDecimalGrade(value, modifier);
    }

    public static slashString(grades: YosemiteDecimalGrade[]): string {
        // TODO similar to font grade slash string behavior
        return grades.map(grade => grade.toString()).join("/");
    }

    public getValue(): number {
        return this.value;
    }

    public getModifier(): Modifier | null {
        return this.modifier;
    }

    public toString(): string {
        return `5.${this.value}${this.modifier ?? ""}`;
    }
}

