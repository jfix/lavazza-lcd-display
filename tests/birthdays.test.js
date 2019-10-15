const birthdays = require('../birthdays');
const moment = require('moment')

test('return birthday object', () => {
    return birthdays().then(d => {
        expect(d).toHaveProperty('today');
        expect(d).toHaveProperty('tomorrow');
        expect(d).toHaveProperty('week');
        expect(d).toHaveProperty('fortnight');
        expect(d).toHaveProperty('month');
        // is there another way to test for an array?
        expect(d.today.length).toBeGreaterThanOrEqual(0);
    })
  });

test('birthday is today', () => {
    const date = moment('2019-10-16T00:00:00');
    return birthdays(date).then(data => {
        expect(data.today.length).toBe(1);
        expect(data.today[0].summary).toBe('Jonathan D')
    })
});

test('birthday is tomorrow', () => {
    const date = moment('2019-10-15T00:00:00');
    return birthdays(date).then(data => {
        expect(data.tomorrow.length).toBe(1);
        expect(data.tomorrow[0].summary).toBe('Jonathan D')
    })
});

test('birthday is this week', () => {
    const date = moment('2019-10-13T00:00:00');
    return birthdays(date).then(data => {
        expect(data.week.length).toBe(1);
        expect(data.week[0].summary).toBe('Jonathan D')
    })
});

test('birthday in the coming two weeks', () => {
    const date = moment('2019-10-14T00:00:00');
    return birthdays(date).then(data => {
        expect(data.fortnight.length).toBe(1);
        expect(data.fortnight[0].summary).toBe('Fred')
    })
});

test('should not fail on wrong argument', () => {
    return birthdays('not-a-moment-object').then(d => {
        expect(d).toHaveProperty('today');
        expect(d).toHaveProperty('tomorrow');
        expect(d).toHaveProperty('week');
        expect(d).toHaveProperty('fortnight');
        expect(d).toHaveProperty('month');
        // is there another way to test for an array?
        expect(d.today.length).toBeGreaterThanOrEqual(0);
    })
})

test('should have the currentDatetime key present', () => {
    return birthdays().then(d => {
        expect(d).toHaveProperty('currentDatetime')
    })
})

test('should have the argumentDatetime key present (if it was supplied)', () => {
    return birthdays('2019-10-11').then(d => {
        expect(d).toHaveProperty('argumentDatetime')
    })
})

test('argumentDatetime key should be undefined (if not supplied)', () => {
    return birthdays().then(d => {
        expect(d).toHaveProperty('argumentDatetime')
        expect(d.argumentDatetime).toBeUndefined()
    })
})
