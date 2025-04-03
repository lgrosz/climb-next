import { describe, expect, test } from '@jest/globals';
import { DateInterval } from './date-interval';
import { BoundType } from './bound';

describe('Date Intervals', () => {
    test('From ISO', () => {
        expect(() => DateInterval.fromISOString("")).toThrow()
        expect(() => DateInterval.fromISOString("2024-03-02")).toThrow()
        expect(() => DateInterval.fromISOString("2024-03-02/")).toThrow()
        expect(() => DateInterval.fromISOString("/2024-03-02")).toThrow()
        expect(() => DateInterval.fromISOString("03-02/2024-03-02")).toThrow()

        expect(
            DateInterval.fromISOString("../..")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Unbounded },
                { type: BoundType.Unbounded }
            )
        )

        expect(
            DateInterval.fromISOString("../2024-03-02")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Unbounded },
                { type: BoundType.Included, value: new Date(2024, 2, 2) }
            )
        )

        expect(
            DateInterval.fromISOString("2024-03-02/..")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Included, value: new Date(2024, 2, 2) },
                { type: BoundType.Unbounded }
            )
        )

        expect(
            DateInterval.fromISOString("2024-03-02/2024-03-04")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Included, value: new Date(2024, 2, 2) },
                { type: BoundType.Included, value: new Date(2024, 2, 4) }
            )
        )
    });
});


