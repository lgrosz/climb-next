import {describe, expect, test} from '@jest/globals';
import FontainebleauGrade from './fontainebleau-grade';

describe('Fontainebleau Grades', () => {
    test('Slash strings', () => {
        expect(
            FontainebleauGrade.slashString([
                FontainebleauGrade.fromString("F7A"),
            ])
        ).toBe("F7A");

        expect(
            FontainebleauGrade.slashString([
                FontainebleauGrade.fromString("F7A"),
                FontainebleauGrade.fromString("F7A+"),
            ])
        ).toBe("F7A/+");

        expect(
            FontainebleauGrade.slashString([
                FontainebleauGrade.fromString("F7A"),
                FontainebleauGrade.fromString("F7B+"),
            ])
        ).toBe("F7A/B+");

        expect(
            FontainebleauGrade.slashString([
                FontainebleauGrade.fromString("F7A"),
                FontainebleauGrade.fromString("F7A+"),
                FontainebleauGrade.fromString("F7B"),
                FontainebleauGrade.fromString("F7B+"),
            ])
        ).toBe("F7A/+/B/+");
    });
})

