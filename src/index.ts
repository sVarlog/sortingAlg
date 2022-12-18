interface NumberItem {
    number: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const stylesToNumber = ({ style }: { style: string }) => {
    return Number(style.replace(/[^\d.]/g, ''));
};

let startTime, endTime;

const start = ({ length, min, max }: { length: number; min: number; max: number }) => {
    const body = document.querySelector('body');
    const sections = body?.querySelectorAll('section');
    const canvas = body?.querySelector('#app') as HTMLCanvasElement | null;
    const mergeSortBtn = body?.querySelector('.mergeSortingBtn');
    const selectionSortBtn = body?.querySelector('.selectionSortingBtn');

    const generateNumbersBtn = body?.querySelector('.generateNumbers');
    const ctx = canvas?.getContext('2d');
    const numberOperationsElement = body?.querySelector('.numberOperations');
    const runtimeElement = body?.querySelector('.runtime');

    if (
        !body ||
        !canvas ||
        !mergeSortBtn ||
        !canvas ||
        !ctx ||
        !generateNumbersBtn ||
        !numberOperationsElement ||
        !runtimeElement
    )
        return;

    // check if there are enough unique diapason for all numbers
    if (max - min < length) throw new Error('You need to increase min/max for that amount of numbers');

    let bodyStyles = getComputedStyle(body);
    let pageWidth = stylesToNumber({ style: bodyStyles.width });
    let pagePadding = stylesToNumber({ style: bodyStyles.padding });

    let numbers: NumberItem[] = [];
    let canvasWidth = pageWidth - pagePadding < 1800 ? pageWidth - pagePadding : 1800;
    let canvasHeight = 400;
    let numberPadding = 20;

    let cellSpace = 5;
    let cellWidht = canvasWidth / length - cellSpace;

    let opertaionsCount = 0;

    // inject runtime to html
    const setRuntime = (ms: number) => {
        runtimeElement.textContent = `${ms} milliseconds`;
    };

    const setOperations = () => {
        numberOperationsElement.textContent = `${opertaionsCount} ${opertaionsCount === 1 ? 'time' : 'times'}`;
    };

    // reseting operations and runtime etc
    const reset = () => {
        startTime = 0;
        endTime = 0;
        opertaionsCount = 0;
        setRuntime(0);
        setOperations();
    };

    const setElementsLength = () => {
        bodyStyles = getComputedStyle(body);
        pageWidth = stylesToNumber({ style: bodyStyles.width });
        pagePadding = stylesToNumber({ style: bodyStyles.padding });

        canvasWidth = pageWidth - pagePadding < 1800 ? pageWidth - pagePadding : 1800;

        cellSpace = 5;
        cellWidht = canvasWidth / length - cellSpace;

        if (sections?.length) {
            for (let i = 0; i < sections.length; i++) {
                sections[i].style.width = `${canvasWidth}px`;
            }
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    };

    setElementsLength();

    // check max number inside numbers and set proportions to number item
    const setNumberData = () => {
        let maxNum = Math.max.apply(
            Math,
            numbers.map((el) => el.number)
        );

        for (let i = 0; i < numbers.length; i++) {
            const cellHeight = ((canvasHeight + numberPadding) * ((numbers[i].number / maxNum) * 100)) / 100;
            const cellX = cellWidht * i + cellSpace * i;
            const cellY = canvasHeight - cellHeight - numberPadding;

            numbers[i].x = cellX;
            numbers[i].y = cellY;
            numbers[i].width = cellWidht;
            numbers[i].height = cellHeight;
        }
    };

    // draw number data on canvas and setOperations
    const drawNumberData = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let fontSize = 16;

        if (numbers.length <= 10) {
            fontSize = 18;
        } else if (numbers.length < 20) {
            fontSize = 16;
        } else if (numbers.length < 50) {
            fontSize = 14;
        } else if (numbers.length < 75) {
            fontSize = 12;
        } else {
            fontSize = 10;
        }

        for (let i = 0; i < numbers.length; i++) {
            const { x, y, width, height, number } = numbers[i];
            const text: string = number.toString();
            ctx.fillStyle = '#0000D1';
            ctx.fillRect(x, y, width, height);

            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = '#000';
            ctx.fillText(text, width * i + cellSpace * i + width / 2 - ctx.measureText(text).width / 2, canvasHeight);
        }

        setOperations();
    };

    // reset and generate new numbers and check for a number of unique
    const generateNumbers = ({ length, min, max }: { length: number; min: number; max: number }) => {
        reset();

        let number: number = 0;

        const setRandom = () => {
            number = Math.ceil(Math.random() * (max - min) + min);
        };

        if (!length || length < 0) return;

        for (let i = 0; i < length; i++) {
            do {
                setRandom();
            } while (numbers.findIndex((el) => el.number === number) != -1);

            numbers[i] = { ...numbers[i], number };
        }

        setNumberData();
        drawNumberData();
    };

    generateNumbers({ length, min, max });

    // merging left and right part to one array and increase operationsCount
    const merge = ({ left, right }: { left: Array<NumberItem>; right: Array<NumberItem> }): NumberItem[] => {
        let sortedNumbers: NumberItem[] = [];

        while (left && right && left.length && right.length) {
            opertaionsCount++;
            if (left[0].number < right[0].number) {
                sortedNumbers.push(left.shift() as NumberItem);
            } else {
                sortedNumbers.push(right.shift() as NumberItem);
            }
        }

        return [...sortedNumbers, ...left, ...right];
    };

    // start dividing the array until there're only one/two elements and then call merge and increate operationsCount
    const mergeSort = ({ numbers }: { numbers: NumberItem[] }): NumberItem[] => {
        opertaionsCount++;

        if (numbers.length <= 1) return numbers;
        const middle = Math.ceil(numbers.length / 2);
        const left: NumberItem[] = mergeSort({
            numbers: numbers.slice(0, middle),
        });
        const right: NumberItem[] = mergeSort({
            numbers: numbers.slice(middle),
        });
        return merge({ left, right });
    };

    // selection sort (select the min value and set it to the start of array)
    const selectSort = ({ numbers }: { numbers: NumberItem[] }): NumberItem[] => {
        let newNumbers = numbers;

        for (let i = 0; i < newNumbers.length; i++) {
            let minNum: NumberItem = newNumbers[i];
            let minNumIndex: number = i;
            for (let j = i; j < newNumbers.length; j++) {
                opertaionsCount++;
                if (j === i) {
                    minNum = newNumbers[j];
                    minNumIndex = j;
                } else if (newNumbers[j].number < minNum.number) {
                    minNum = newNumbers[j];
                    minNumIndex = j;
                }
            }
            newNumbers[minNumIndex] = newNumbers[i];
            newNumbers[i] = minNum;
        }

        return newNumbers;
    };

    // reset data and start selection sort
    selectionSortBtn?.addEventListener('click', (e) => {
        reset();

        startTime = performance.now();
        numbers = selectSort({ numbers });
        endTime = performance.now();

        setOperations();
        setRuntime(endTime - startTime);
        setNumberData();
        drawNumberData();
    });

    // reset data and start merge sort
    mergeSortBtn.addEventListener('click', (e) => {
        reset();

        startTime = performance.now();
        numbers = mergeSort({ numbers });
        endTime = performance.now();

        setOperations();
        setRuntime(endTime - startTime);
        setNumberData();
        drawNumberData();
    });

    // generate new numbers
    generateNumbersBtn.addEventListener('click', () => {
        generateNumbers({ length, min, max });
        setNumberData();
        drawNumberData();
    });

    // event for render new proporties
    window.addEventListener('resize', () => {
        setElementsLength();
        setNumberData();
        drawNumberData();
    });
};

document.addEventListener('DOMContentLoaded', () => {
    start({ length: 50, min: 1, max: 199 });
});
