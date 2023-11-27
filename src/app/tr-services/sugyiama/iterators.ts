/* Generator/Iterator function that returns items as of the Iterable tuples of neighbours */
export function* neighbours<I>(iterable: Iterable<I>): IterableIterator<[I, I]> {
    // Create iterator
    const iterator: Iterator<I, unknown> = iterable[Symbol.iterator]();

    // Get the first item of the iterator
    const item = iterator.next();

    // If item is not the last element in iterable
    if (!item.done) {
        let last = item.value;
        let neighbour;

        // while there are next items in the iterable,
        // return tuples of the current and neighbouring items
        while (!(neighbour = iterator.next()).done) {
            yield [last, neighbour.value];
            last = neighbour.value;
        }
    }
}

/* Generator/Iterator function that returns items as of the Iterable tuples of neighbours */
export function* neighboursIndexed<I>(iterable: Iterable<I>): IterableIterator<[number, I, number, I]> {
    // Create iterator
    const iterator: Iterator<I, unknown> = iterable[Symbol.iterator]();

    let i = 0;

    // Get the first item of the iterator
    const item = iterator.next();

    // If item is not the last element in iterable
    if (!item.done) {
        let last = item.value;
        let neighbour;

        // while there are next items in the iterable,
        // return tuples of the current and neighbouring items
        while (!(neighbour = iterator.next()).done) {
            yield [i, last, i+1, neighbour.value];
            last = neighbour.value;
            i++;
        }
    }
}