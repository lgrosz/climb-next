class FontainebleauParseGradeError extends Error {
    constructor(message: string = "Failed to parse Fontainebleau grade") {
        super(message);
        this.name = "FontainebleauParseGradeError";
    }
}

enum Modifier {
    A = "A",
    B = "B",
    C = "C"
}

export default class FontainebleauGrade {
    private value: number;
    private modifier: Modifier | null;
    private plus: boolean;

    // TODO Fb is a valid prefix
    // TODO This is strict, maybe there should be a lenient parsing mode, too? e.g. grade like 8a would parse as F8A
    private static readonly validGrades = /^F?(\d+)([ABC]?)(\+?)$/;

    constructor(value: number, modifier: Modifier | null, plus: boolean) {
        if (value < 1) {
            throw new FontainebleauParseGradeError("Invalid grade value");
        }

        if (value < 6 && modifier !== null) {
            throw new FontainebleauParseGradeError("Grades below 6 cannot have a modifier");
        }

        if (value >= 6 && modifier === null) {
            throw new FontainebleauParseGradeError("Grades 6 and above must have a modifier");
        }

        this.value = value;
        this.modifier = modifier;
        this.plus = plus;
    }

    public static fromString(s: string): FontainebleauGrade {
        const match = s.match(FontainebleauGrade.validGrades);

        if (!match) {
            throw new FontainebleauParseGradeError();
        }

        const value = parseInt(match[1], 10);
        const modifier: Modifier | null = match[2] ? (match[2] as Modifier) : null;
        const plus = match[3] === "+";

        if (value < 6 && modifier !== null) {
            throw new FontainebleauParseGradeError("Grades below 6 cannot have a modifier");
        }

        if (value >= 6 && modifier === null) {
            throw new FontainebleauParseGradeError("Grades 6 and above must have a modifier");
        }

        return new FontainebleauGrade(value, modifier, plus);
    }

    public static slashString(grades: FontainebleauGrade[]): string {
        // TODO
        // [F8A, F8A+] ==> F8A/+
        // [F8A, F8A+, F8B] ==> F8A/+/B
        // [F6C+, F7A] ==> F6C+/7A
        return grades.map(grade => grade.toString()).join("/");
    }

    public getValue(): number {
        return this.value;
    }

    public getModifier(): Modifier | null {
        return this.modifier;
    }

    public hasPlus(): boolean {
        return this.plus;
    }

    public toString(): string {
        return `F${this.value}${this.modifier ?? ""}${this.plus ? "+" : ""}`;
    }
}

