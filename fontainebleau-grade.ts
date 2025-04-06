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
        let gradeStrings = [];
        let last = "";
        for (const grade of grades) {
            const gradeString = grade.toString();

            let i = 0;
            while(last[i] && gradeString[i] === last[i]) {
                i++;
            }

            gradeStrings.push(gradeString.slice(i))
            last = gradeString;
        }

        return gradeStrings.join("/");
    }

    public static compare(left: FontainebleauGrade, right: FontainebleauGrade) {
        if (left.value != right.value) {
            return left.value - right.value;
        }

        if (left.modifier != right.modifier) {
            if (left.modifier != null && right.modifier != null) {
                const order = ["A", "B", "C"];
                return order.indexOf(left.modifier) - order.indexOf(right.modifier);
            }
        }

        return Number(left.plus) - Number(right.plus);
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

