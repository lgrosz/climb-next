import { describe, expect, test } from '@jest/globals';
import { DateInterval } from './date-interval';
import { BoundType } from './bound';

describe('Date Intervals', () => {
    test('From ISO', () => {
        expect(() => DateInterval.fromISO("")).toThrow()
        expect(() => DateInterval.fromISO("2024-03-02")).toThrow()
        expect(() => DateInterval.fromISO("2024-03-02/")).toThrow()
        expect(() => DateInterval.fromISO("/2024-03-02")).toThrow()
        expect(() => DateInterval.fromISO("03-02/2024-03-02")).toThrow()

        expect(
            DateInterval.fromISO("../..")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Unbounded },
                { type: BoundType.Unbounded }
            )
        )

        expect(
            DateInterval.fromISO("../2024-03-02")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Unbounded },
                { type: BoundType.Included, value: new Date(2024, 2, 2) }
            )
        )

        expect(
            DateInterval.fromISO("2024-03-02/..")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Included, value: new Date(2024, 2, 2) },
                { type: BoundType.Unbounded }
            )
        )

        expect(
            DateInterval.fromISO("2024-03-02/2024-03-04")
        ).toStrictEqual(
            new DateInterval(
                { type: BoundType.Included, value: new Date(2024, 2, 2) },
                { type: BoundType.Included, value: new Date(2024, 2, 4) }
            )
        )
    });
});


