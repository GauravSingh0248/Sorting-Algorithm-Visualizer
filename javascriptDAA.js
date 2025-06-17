let array = [];
let comparisons = 0;
let stepI = 0, stepJ = 0, stepMode = false, stepArray = [];
let isSorting = false;
let selectedAlgorithm = 'bubbleSort'; // Default algorithm
let isDarkTheme = true; // Default theme is dark
let comparisonChart = null;
let currentStep = 0;
let totalSteps = 0;

function updateGraphBoxHeights() {
    // Calculate appropriate height based on max value in array
    const maxValue = Math.max(...array);
    // More responsive height calculation:
    // Base height of 420px for values up to 100
    // For each 10 units above 100, add 30px to height
    const newHeight = Math.max(420, 420 + (maxValue > 100 ? Math.ceil((maxValue - 100) / 10) * 30 : 0));
    
    // Update both graph boxes
    document.getElementById('originalGraph').style.height = newHeight + 'px';
    document.getElementById('sortingGraph').style.height = newHeight + 'px';
    
    // Also update container height to accommodate taller graphs
    document.querySelector('.graph-container').style.minHeight = (newHeight + 50) + 'px';
}

// Function to format large numbers for display
function formatNumberForDisplay(value, barWidth) {
    const str = value.toString();

    // Calculate how many characters can fit based on bar width
    const maxChars = Math.max(2, Math.floor(barWidth / 7)); // More generous character spacing

    if (str.length <= maxChars) {
        return str; // Return full number if it fits
    }

    // For numbers that don't fit, use smart abbreviation
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    } else {
        // For smaller numbers that still don't fit, truncate intelligently
        return str.substring(0, maxChars);
    }
}

// Function to calculate optimal font size for bar text
function calculateOptimalFontSize(barWidth, barHeight, textLength) {
    // More generous font size calculation
    const maxWidthBasedSize = Math.floor(barWidth / (textLength * 0.5)); // Reduced multiplier for more space
    const maxHeightBasedSize = Math.floor(barHeight * 0.6); // Increased height usage

    // Choose the smaller of the two to ensure text fits
    let fontSize = Math.min(maxWidthBasedSize, maxHeightBasedSize);

    // Set more reasonable bounds - allow smaller fonts for large numbers
    fontSize = Math.max(6, Math.min(fontSize, 18)); // Wider range: 6px to 18px

    return fontSize;
}

function drawBars(containerId, data, active = {}, swap = {}, sorted = {}, current = {}) {
    // Update graph box heights first
    updateGraphBoxHeights();

    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const spacing = container.offsetWidth / data.length;
    const barWidth = spacing - 2;

    data.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        const barHeight = value * 2;
        bar.style.height = barHeight + 'px';
        bar.style.left = index * spacing + 'px';
        bar.style.width = barWidth + 'px';
        bar.setAttribute('data-value', value);

        // Add the number inside the bar with dynamic font sizing
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';

        // Format the number for display based on available bar width
        const displayText = formatNumberForDisplay(value, barWidth);
        barValue.textContent = displayText;

        const textLength = displayText.length;
        const optimalFontSize = calculateOptimalFontSize(barWidth, barHeight, textLength);
        barValue.style.fontSize = optimalFontSize + 'px';

        // Ensure text fits properly with better spacing
        barValue.style.maxWidth = (barWidth - 4) + 'px'; // Leave 2px padding on each side
        barValue.style.overflow = 'hidden';
        barValue.style.textOverflow = 'ellipsis';
        barValue.style.whiteSpace = 'nowrap';

        // Show numbers in bars unless they're extremely small
        if (barHeight < 12 || barWidth < 12) {
            barValue.style.display = 'none';
            bar.setAttribute('title', `Value: ${value}`); // Show as tooltip with full value
        } else {
            // Always show the number, but add tooltip if abbreviated
            if (displayText !== value.toString()) {
                bar.setAttribute('title', `Full value: ${value}`);
            }
        }

        bar.appendChild(barValue);

        if (containerId === 'sortingGraph') {
            // Remove any existing classes and inline styles
            bar.classList.remove('comparing', 'swapping', 'sorted', 'current');
            bar.style.backgroundColor = ''; // Clear inline styles
            bar.style.border = '';
            bar.style.boxShadow = '';
            bar.style.transform = '';

            if (sorted[index]) {
                bar.classList.add('sorted');
            } else if (swap[index]) {
                bar.classList.add('swapping');
            } else if (active[index]) {
                bar.classList.add('comparing');
            } else if (current[index]) {
                bar.classList.add('current');
            } else {
                // Apply default styling only if no special class is applied
                bar.style.backgroundColor = '#00d4b5';
            }
        } else {
            bar.style.backgroundColor = '#00d4b5'; // Default bar color for originalGraph
        }

        const label = document.createElement('span');
        label.textContent = value;
        bar.appendChild(label);
        container.appendChild(bar);
    });

    // Update the sorted value dynamically if the container is the sortingGraph
    if (containerId === 'sortingGraph') {
        document.getElementById('sortedValueArray').textContent = data.join(', ');
    }
}

// Function to show step explanation with speed-based timing
async function showStepExplanation(stepText, details = '', customDelay = null) {
    const container = document.getElementById('stepExplanationContainer');
    const stepTextElement = document.getElementById('currentStepText');
    const stepDetailsElement = document.getElementById('stepDetails');

    container.style.display = 'block';
    stepTextElement.textContent = stepText;
    stepDetailsElement.textContent = details;

    // Calculate delay based on speed setting if not provided
    if (customDelay === null) {
        const speed = parseInt(document.getElementById('speed').value);
        // Speed ranges from 1 (slowest) to 10 (fastest)
        // Convert to delay: speed 1 = 4000ms, speed 10 = 50ms
        const delay = speed === 1 ? 4000 : speed === 10 ? 50 : (11 - speed) * 200;
        await sleep(delay);
    } else {
        await sleep(customDelay);
    }
}

// Function to hide step explanation
function hideStepExplanation() {
    const container = document.getElementById('stepExplanationContainer');
    container.style.display = 'none';
}

// Team and member information data
const teamInfo = {
    name: "Algorithm Avengers",
    description: "A passionate team of computer science students dedicated to creating innovative educational tools for algorithm visualization and learning.",
    mission: "To make complex algorithms accessible and understandable through interactive visualizations.",
    established: "2024",
    project: "Sorting Algorithm Visualizer",
    achievements: [
        "Created comprehensive sorting algorithm visualizer",
        "Implemented 7 different sorting algorithms",
        "Designed intuitive user interface with real-time feedback",
        "Added educational step-by-step explanations",
        "Developed performance comparison tools"
    ]
};

const memberInfo = {
    saksham: {
        name: "Saksham Godiyal",
        role: "Core Coder & Lead Developer",
        description: "The technical backbone of the team, responsible for implementing core algorithms and system architecture.",
        skills: ["Algorithm Design", "Data Structures", "Frontend Development", "Problem Solving"],
        contributions: [
            "Implemented all 7 sorting algorithms",
            "Designed the visualization engine",
            "Created dynamic bar animations",
            "Developed step-by-step explanation system",
            "Optimized performance and user experience"
        ],
        quote: "Code is poetry in motion, and algorithms are the verses that solve real-world problems."
    },
    payal: {
        name: "Payal Maletha",
        role: "HTML & CSS Virtuoso",
        description: "Architect of structure and style, Payal transforms ideas into elegant, responsive layouts. Her mastery of HTML and CSS brings every pixel to life, ensuring the visual harmony and accessibility of the project.",
        skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Visual Storytelling", "UI Consistency"],
        contributions: [
            "Wove the visual fabric of the interface with modern HTML & CSS",
            "Engineered seamless theme transitions and adaptive layouts",
            "Crafted the intro slide and project branding",
            "Ensured every element is both beautiful and functional",
            "Set the gold standard for code readability and maintainability"
        ],
        quote: "Every tag and style is a brushstroke on the canvas of user experience."
    },
    gaurav: {
        name: "Gaurav Singh",
        role: "Algorithm Analyst & Performance Optimizer",
        description: "Expert in algorithm analysis and performance optimization techniques.",
        skills: ["Algorithm Analysis", "Performance Optimization", "Data Analysis", "Testing", "Documentation"],
        contributions: [
            "Analyzed algorithm time complexities",
            "Implemented performance measurement tools",
            "Created algorithm comparison features",
            "Developed testing frameworks",
            "Optimized sorting speed controls"
        ],
        quote: "Understanding the 'why' behind algorithms is just as important as knowing the 'how'."
    },
    ritik: {
        name: "Ritik Bhandari",
        role: "Front-End Visionary",
        description: "Ritik breathes life into the interface, blending creativity with code. His expertise in frontend development ensures smooth animations, interactive features, and a delightful user journey from start to finish.",
        skills: ["HTML5", "CSS3", "UI Animation", "Responsive Design", "User Interaction"],
        contributions: [
            "Brought the sorting visualizations to life with dynamic effects",
            "Engineered interactive elements for intuitive exploration",
            "Optimized the user experience for speed and clarity",
            "Bridged design and logic for a seamless frontend flow",
            "Inspired the team with innovative UI solutions"
        ],
        quote: "A great interface is where imagination meets interaction—every detail matters."
    }
};

// Function to show team information
function showTeamInfo() {
    const modal = document.getElementById('infoModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2>${teamInfo.name}</h2>
        <p><strong>Description:</strong> ${teamInfo.description}</p>
        <p><strong>Mission:</strong> ${teamInfo.mission}</p>
        <p><strong>Project:</strong> ${teamInfo.project}</p>
        <p><strong>Established:</strong> ${teamInfo.established}</p>

        <h3>Team Achievements</h3>
        <ul>
            ${teamInfo.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
        </ul>

        <p style="text-align: center; margin-top: 30px; font-style: italic; color: #00d4b5;">
            "Together we turn complex algorithms into beautiful, understandable visualizations!"
        </p>
    `;

    modal.style.display = 'block';
}

// Function to show member information
function showMemberInfo(memberKey) {
    const member = memberInfo[memberKey];
    if (!member) return;

    const modal = document.getElementById('infoModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2>${member.name}</h2>
        <div class="member-role">${member.role}</div>

        <p><strong>About:</strong> ${member.description}</p>

        <h3>Skills & Expertise</h3>
        <div class="member-skills">
            ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>

        <h3>Key Contributions</h3>
        <ul>
            ${member.contributions.map(contribution => `<li>${contribution}</li>`).join('')}
        </ul>

        <p style="text-align: center; margin-top: 25px; font-style: italic; color: #00d4b5;">
            "${member.quote}"
        </p>
    `;

    modal.style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('infoModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Highlight sorted bars in green after sorting is complete
function highlightSortedBars(containerId) {
    const container = document.getElementById(containerId).children;
    for (let bar of container) {
        bar.classList.add('sorted'); // Add the 'sorted' class to change color
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    await showStepExplanation("Starting Bubble Sort", "We'll compare adjacent elements and swap them if they're in wrong order");

    for (let i = 0; i < data.length - 1; i++) {
        await showStepExplanation(
            `Pass ${i + 1} of ${data.length - 1}`,
            `In this pass, the largest unsorted element will "bubble up" to position ${data.length - i - 1}`
        );

        for (let j = 0; j < data.length - i - 1; j++) {
            const active = { [j]: true, [j + 1]: true };
            comparisons++;

            await showStepExplanation(
                `Comparing elements at positions ${j} and ${j + 1}`,
                `Comparing ${data[j]} and ${data[j + 1]} - ${data[j] > data[j + 1] ? 'Need to swap!' : 'Already in correct order'}`
            );

            if (data[j] > data[j + 1]) {
                [data[j], data[j + 1]] = [data[j + 1], data[j]];
                drawBars('sortingGraph', data, active, { [j]: true, [j + 1]: true });
                await showStepExplanation(
                    `Swapped ${data[j + 1]} and ${data[j]}`,
                    `${data[j + 1]} > ${data[j]}, so we swapped them to maintain ascending order`
                );
            } else {
                drawBars('sortingGraph', data, active);
            }
            await sleep(speed * 20);
        }

        // Mark the last element of this pass as sorted
        const sortedElements = {};
        for (let k = data.length - i - 1; k < data.length; k++) {
            sortedElements[k] = true;
        }
        drawBars('sortingGraph', data, {}, {}, sortedElements);

        await showStepExplanation(
            `Pass ${i + 1} completed`,
            `Element ${data[data.length - i - 1]} is now in its final sorted position`
        );
        await sleep(speed * 30);
    }

    highlightSortedBars('sortingGraph'); // Highlight sorted bars
    await showStepExplanation("Bubble Sort Complete!", "All elements are now sorted in ascending order", 3000);

    setTimeout(() => {
        hideStepExplanation();
    }, 1000);

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n^2)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

async function selectionSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    await showStepExplanation("Starting Selection Sort", "We'll find the minimum element and place it at the beginning");

    for (let i = 0; i < data.length - 1; i++) {
        let minIndex = i;

        await showStepExplanation(
            `Finding minimum in unsorted portion (positions ${i} to ${data.length - 1})`,
            `Current minimum candidate: ${data[minIndex]} at position ${minIndex}`
        );

        const current = { [i]: true };
        drawBars('sortingGraph', data, {}, {}, {}, current);
        await sleep(speed * 30);

        for (let j = i + 1; j < data.length; j++) {
            comparisons++;

            await showStepExplanation(
                `Comparing ${data[j]} at position ${j} with current minimum ${data[minIndex]}`,
                `${data[j] < data[minIndex] ? `Found new minimum: ${data[j]}` : `${data[minIndex]} is still the minimum`}`
            );

            if (data[j] < data[minIndex]) {
                minIndex = j;
            }

            const active = { [i]: true, [j]: true, [minIndex]: true };
            drawBars('sortingGraph', data, active);
            await sleep(speed * 20);
        }

        if (minIndex !== i) {
            await showStepExplanation(
                `Swapping ${data[i]} at position ${i} with ${data[minIndex]} at position ${minIndex}`,
                `Placing the minimum element ${data[minIndex]} in its correct sorted position`
            );

            [data[i], data[minIndex]] = [data[minIndex], data[i]];
            drawBars('sortingGraph', data, {}, { [i]: true, [minIndex]: true });
            await sleep(speed * 30);
        }

        // Mark sorted elements
        const sortedElements = {};
        for (let k = 0; k <= i; k++) {
            sortedElements[k] = true;
        }
        drawBars('sortingGraph', data, {}, {}, sortedElements);

        await showStepExplanation(
            `Position ${i} is now sorted`,
            `Element ${data[i]} is in its final position. ${data.length - i - 1} elements remaining.`
        );
        await sleep(speed * 20);
    }

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    await showStepExplanation("Selection Sort Complete!", "All elements are now sorted in ascending order", 3000);

    setTimeout(() => {
        hideStepExplanation();
    }, 1000);

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n^2)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Add missing sorting algorithm implementations
async function insertionSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    await showStepExplanation("Starting Insertion Sort", "We'll build the sorted array one element at a time");

    for (let i = 1; i < data.length; i++) {
        let key = data[i];
        let j = i - 1;

        await showStepExplanation(
            `Inserting element ${key} from position ${i}`,
            `We'll find the correct position for ${key} in the sorted portion (positions 0 to ${i-1})`
        );

        const current = { [i]: true };
        drawBars('sortingGraph', data, {}, {}, {}, current);
        await sleep(speed * 30);

        while (j >= 0 && data[j] > key) {
            comparisons++;

            await showStepExplanation(
                `Comparing ${key} with ${data[j]} at position ${j}`,
                `${data[j]} > ${key}, so we shift ${data[j]} one position to the right`
            );

            data[j + 1] = data[j];
            j--;

            const active = { [j + 1]: true, [j + 2]: true };
            drawBars('sortingGraph', data, active);
            await sleep(speed * 20);
        }

        data[j + 1] = key;

        await showStepExplanation(
            `Placed ${key} at position ${j + 1}`,
            `${key} is now in its correct position relative to the sorted portion`
        );

        // Mark sorted elements
        const sortedElements = {};
        for (let k = 0; k <= i; k++) {
            sortedElements[k] = true;
        }
        drawBars('sortingGraph', data, {}, {}, sortedElements);
        await sleep(speed * 30);
    }

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    await showStepExplanation("Insertion Sort Complete!", "All elements are now sorted in ascending order", 3000);

    setTimeout(() => {
        hideStepExplanation();
    }, 1000);

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n^2)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Merge Sort Implementation
async function mergeSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    await showStepExplanation("Starting Merge Sort", "We'll divide the array into smaller parts and then merge them back in sorted order");

    async function merge(arr, left, mid, right) {
        let n1 = mid - left + 1;
        let n2 = right - mid;

        let L = arr.slice(left, mid + 1);
        let R = arr.slice(mid + 1, right + 1);

        await showStepExplanation(
            `Merging subarrays [${left}...${mid}] and [${mid + 1}...${right}]`,
            `Left: [${L.join(', ')}], Right: [${R.join(', ')}]`
        );

        let i = 0, j = 0, k = left;

        while (i < n1 && j < n2) {
            comparisons++;

            showStepExplanation(
                `Comparing ${L[i]} and ${R[j]}`,
                `Placing ${L[i] <= R[j] ? L[i] : R[j]} at position ${k}`
            );

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            drawBars('sortingGraph', data, { [k]: true });
            await sleep(speed * 20);
            k++;
        }

        while (i < n1) {
            showStepExplanation(
                `Copying remaining elements from left subarray`,
                `Placing ${L[i]} at position ${k}`
            );
            arr[k] = L[i];
            i++;
            k++;
            drawBars('sortingGraph', data, { [k]: true });
            await sleep(speed * 20);
        }

        while (j < n2) {
            showStepExplanation(
                `Copying remaining elements from right subarray`,
                `Placing ${R[j]} at position ${k}`
            );
            arr[k] = R[j];
            j++;
            k++;
            drawBars('sortingGraph', data, { [k]: true });
            await sleep(speed * 20);
        }

        showStepExplanation(
            `Merge complete for range [${left}...${right}]`,
            `Subarray is now sorted: [${arr.slice(left, right + 1).join(', ')}]`
        );
    }

    async function mergeSortRecursive(arr, left, right) {
        if (left < right) {
            let mid = Math.floor((left + right) / 2);

            showStepExplanation(
                `Dividing array [${left}...${right}]`,
                `Split into [${left}...${mid}] and [${mid + 1}...${right}]`
            );

            await mergeSortRecursive(arr, left, mid);
            await mergeSortRecursive(arr, mid + 1, right);
            await merge(arr, left, mid, right);
        }
    }

    await mergeSortRecursive(data, 0, data.length - 1);

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    showStepExplanation("Merge Sort Complete!", "All elements are now sorted in ascending order");

    setTimeout(() => {
        hideStepExplanation();
    }, 3000);

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n log n)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Quick Sort Implementation
async function quickSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    async function partition(arr, low, high) {
        let pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            comparisons++;
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                drawBars('sortingGraph', data, { [i]: true, [j]: true });
                await sleep(speed * 20);
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        drawBars('sortingGraph', data, { [i + 1]: true, [high]: true });
        await sleep(speed * 20);
        return i + 1;
    }

    async function quickSortRecursive(arr, low, high) {
        if (low < high) {
            let pi = await partition(arr, low, high);
            await quickSortRecursive(arr, low, pi - 1);
            await quickSortRecursive(arr, pi + 1, high);
        }
    }

    await quickSortRecursive(data, 0, data.length - 1);

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n log n)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Heap Sort Implementation
async function heapSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    async function heapify(arr, n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            drawBars('sortingGraph', data, { [i]: true, [largest]: true });
            await sleep(speed * 20);
            await heapify(arr, n, largest);
        }
    }

    for (let i = Math.floor(data.length / 2) - 1; i >= 0; i--) {
        await heapify(data, data.length, i);
    }

    for (let i = data.length - 1; i > 0; i--) {
        [data[0], data[i]] = [data[i], data[0]];
        drawBars('sortingGraph', data, { [0]: true, [i]: true });
        await sleep(speed * 20);
        await heapify(data, i, 0);
    }

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(n log n)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Radix Sort Implementation
async function radixSort(data) {
    if (isSorting) return;
    isSorting = true;
    comparisons = 0;
    const speed = 11 - parseInt(document.getElementById('speed').value);
    const t0 = performance.now();

    const getMax = (arr) => Math.max(...arr);

    const countingSort = async (arr, exp) => {
        let output = new Array(arr.length).fill(0);
        let count = new Array(10).fill(0);

        for (let i = 0; i < arr.length; i++) {
            count[Math.floor(arr[i] / exp) % 10]++;
        }

        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        for (let i = arr.length - 1; i >= 0; i--) {
            output[count[Math.floor(arr[i] / exp) % 10] - 1] = arr[i];
            count[Math.floor(arr[i] / exp) % 10]--;
        }

        for (let i = 0; i < arr.length; i++) {
            arr[i] = output[i];
            drawBars('sortingGraph', data, { [i]: true });
            await sleep(speed * 20);
        }
    };

    let max = getMax(data);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        await countingSort(data, exp);
    }

    const container = document.getElementById('sortingGraph').children;
    for (let bar of container) bar.style.backgroundColor = 'green';

    const t1 = performance.now();
    document.getElementById("comparisons").innerText = comparisons;
    document.getElementById("time-complexity").innerText = "O(nk)";
    document.getElementById("time-taken").innerText = (t1 - t0).toFixed(2);
    isSorting = false;
}

// Enhanced algorithm definitions with step-by-step explanations
const algorithmDefinitions = {
    bubbleSort: {
        title: "What is Bubble Sort?",
        description: "Bubble Sort is a simple sorting algorithm that repeatedly compares two adjacent elements and swaps them if they are in the wrong order. This process continues until the list is sorted. It's named 'bubble' because the largest values 'bubble up' to the end.",
        steps: [
            "1. Start at the beginning of the array",
            "2. Compare adjacent elements (arr[j] and arr[j+1])",
            "3. If arr[j] > arr[j+1], swap them",
            "4. Move to the next pair of elements",
            "5. After one complete pass, the largest element is at the end",
            "6. Repeat the process for the remaining elements (excluding the sorted ones)",
            "7. Continue until no more swaps are needed"
        ],
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        bestCase: "O(n) when array is already sorted"
    },
    selectionSort: {
        title: "What is Selection Sort?",
        description: "Selection Sort selects the smallest element from an unsorted list in each iteration and places it at the beginning of the list.",
        steps: [
            "1. Find the minimum element in the unsorted part of the array",
            "2. Swap it with the element at the current position",
            "3. Move the boundary of the unsorted array one element to the right",
            "4. Repeat until the entire array is sorted"
        ],
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        bestCase: "O(n²) even if array is already sorted"
    },
    insertionSort: {
        title: "What is Insertion Sort?",
        description: "Insertion Sort builds the final sorted array one item at a time. It's much like sorting playing cards in your hand.",
        steps: [
            "1. Start with the second element (assume first element is sorted)",
            "2. Compare the current element with previous elements",
            "3. If the previous element is greater, move it one position ahead",
            "4. Repeat until the correct position for current element is found",
            "5. Insert the current element at the correct position",
            "6. Repeat for all elements in the array"
        ],
        timeComplexity: "O(n²)",
        spaceComplexity: "O(1)",
        bestCase: "O(n) when array is already sorted"
    },
    mergeSort: {
        title: "What is Merge Sort?",
        description: "Merge Sort is a divide and conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves.",
        steps: [
            "1. Divide the array into two halves",
            "2. Recursively sort the two halves",
            "3. Merge the sorted halves to produce a single sorted array",
            "4. During merging, compare elements from both halves and place the smaller one first"
        ],
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(n)",
        bestCase: "O(n log n) regardless of input"
    },
    quickSort: {
        title: "What is Quick Sort?",
        description: "Quick Sort is a divide and conquer algorithm that picks an element as a pivot and partitions the array around the pivot.",
        steps: [
            "1. Choose a pivot element from the array",
            "2. Partition the array: items less than pivot go left, greater go right",
            "3. Recursively apply the above steps to the sub-arrays",
            "4. The base case is arrays of size 0 or 1, which are already sorted"
        ],
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(log n)",
        bestCase: "O(n log n) typically, O(n²) in worst case"
    },
    heapSort: {
        title: "What is Heap Sort?",
        description: "Heap Sort builds a max heap from the array and repeatedly extracts the maximum element to sort the array.",
        steps: [
            "1. Build a max heap from the input data",
            "2. Extract the largest element (root) and place it at the end",
            "3. Reduce the heap size by 1",
            "4. Heapify the root of the tree",
            "5. Repeat steps 2-4 until the heap size is 1"
        ],
        timeComplexity: "O(n log n)",
        spaceComplexity: "O(1)",
        bestCase: "O(n log n) regardless of input"
    },
    radixSort: {
        title: "What is Radix Sort?",
        description: "Radix Sort is a non-comparative sorting algorithm that sorts numbers digit by digit, starting from the least significant digit.",
        steps: [
            "1. Find the maximum number to know the number of digits",
            "2. For each digit position (starting from least significant):",
            "3. Sort the elements based on the current digit position",
            "4. This sorting is done using counting sort (a stable sort)",
            "5. Repeat until all digit positions are processed"
        ],
        timeComplexity: "O(nk)",
        spaceComplexity: "O(n+k)",
        bestCase: "O(nk) where k is the number of digits"
    }
};

function startSorting(sortFunction) {
    drawBars('originalGraph', array);
    drawBars('sortingGraph', array);

    // Show step explanation container
    document.getElementById('stepExplanationContainer').style.display = 'block';

    sortFunction([...array]);
    updateCurrentInputDisplay();
}

function changeAlgorithm() {
    const algorithm = document.getElementById('algorithm').value;
    switch (algorithm) {
        case 'bubbleSort':
            startSorting(bubbleSort);
            break;
        case 'selectionSort':
            startSorting(selectionSort);
            break;
        // Add cases for other algorithms (insertionSort, mergeSort, quickSort, heapSort, radixSort)
        default:
            console.error('Algorithm not implemented');
    }
}

// Update the definition section based on the selected algorithm
function updateSelectedAlgorithm() {
    const algorithmDropdown = document.getElementById('algorithm');
    selectedAlgorithm = algorithmDropdown.value;

    const selectedSortButton = document.getElementById('selectedSortButton');
    selectedSortButton.textContent = algorithmDropdown.options[algorithmDropdown.selectedIndex].text;

    const { title, description, steps, timeComplexity, spaceComplexity, bestCase } = algorithmDefinitions[selectedAlgorithm];
    
    // Update the algorithm title and description
    document.getElementById('algorithmTitle').textContent = title;
    document.getElementById('algorithmDescription').textContent = description;
    
    // Update the algorithm steps
    const stepsContainer = document.getElementById('algorithmSteps');
    if (stepsContainer) {
        stepsContainer.innerHTML = '';
        steps.forEach(step => {
            const stepElement = document.createElement('li');
            stepElement.textContent = step;
            stepsContainer.appendChild(stepElement);
        });
    }
    
    // Update complexity information
    const complexityInfo = document.getElementById('complexityInfo');
    if (complexityInfo) {
        complexityInfo.innerHTML = `
            <p><strong>Time Complexity:</strong> ${timeComplexity}</p>
            <p><strong>Space Complexity:</strong> ${spaceComplexity}</p>
            <p><strong>Best Case:</strong> ${bestCase}</p>
        `;
    }
}

// Execute the selected sorting algorithm
function executeSelectedSort() {
    switch (selectedAlgorithm) {
        case 'bubbleSort':
            startSorting(bubbleSort);
            break;
        case 'selectionSort':
            startSorting(selectionSort);
            break;
        case 'insertionSort':
            startSorting(insertionSort);
            break;
        case 'mergeSort':
            startSorting(mergeSort);
            break;
        case 'quickSort':
            startSorting(quickSort);
            break;
        case 'heapSort':
            startSorting(heapSort);
            break;
        case 'radixSort':
            startSorting(radixSort);
            break;
        default:
            console.error('Algorithm not implemented');
    }
}

function updateArraySize(size) {
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 90 + 10));
    updateGraphBoxHeights(); // Call this first to update heights
    drawBars('originalGraph', array);
    drawBars('sortingGraph', array);
    updateCurrentInputDisplay();
}

function setCustomInput() {
    document.getElementById('customInputContainer').style.display = 'flex';
    updateCurrentInputDisplay();
}

function updateCustomArray() {
    const input = document.getElementById('customInput').value;
    if (input) {
        array = input.split(',').map(Number).filter(n => !isNaN(n));
        updateGraphBoxHeights(); // Call this first to update heights
        drawBars('originalGraph', array);
        drawBars('sortingGraph', array);
        updateCurrentInputDisplay();
    }
}

function startStepMode() {
    stepArray = [...array];
    stepI = 0;
    stepJ = 0;
    stepMode = true;
    drawBars('sortingGraph', stepArray);
    updateCurrentInputDisplay();
}

function nextStep() {
    if (!stepMode) return;

    if (stepI < stepArray.length - 1) {
        if (stepJ < stepArray.length - stepI - 1) {
            const active = { [stepJ]: true, [stepJ + 1]: true };
            if (stepArray[stepJ] > stepArray[stepJ + 1]) {
                [stepArray[stepJ], stepArray[stepJ + 1]] = [stepArray[stepJ + 1], stepArray[stepJ]];
                drawBars('sortingGraph', stepArray, active, active);
            } else {
                drawBars('sortingGraph', stepArray, active);
            }
            stepJ++;
        } else {
            stepJ = 0;
            stepI++;
        }
    } else {
        const container = document.getElementById('sortingGraph').children;
        for (let bar of container) bar.style.backgroundColor = 'green';
        stepMode = false;
    }
}

function updateCurrentInputDisplay() {
    document.getElementById('currentInputArray').textContent = array.join(', ');
    var width = Math.min(1200, Math.max(300, array.length * 20));
    document.getElementById('originalGraph').style.width = width + 'px';
    document.getElementById('sortingGraph').style.width = width + 'px';
    var originalInputSpan = document.getElementById('originalInputArray');
    if (originalInputSpan) {
        originalInputSpan.textContent = array.join(', ');
    }
    var sortedValueSpan = document.getElementById('sortedValueArray');
    if (sortedValueSpan) {
        sortedValueSpan.textContent = [...array].sort((a, b) => a - b).join(', ');
    }
}

// Theme-based color for sortingGraph
function updateSortingGraphTheme() {
    const sortingGraph = document.getElementById('sortingGraph');
    const originalGraph = document.getElementById('originalGraph');
    
    if (sortingGraph) {
        sortingGraph.style.backgroundColor = isDarkTheme ? '#333' : '#ffffff';
    }
    
    if (originalGraph) {
        originalGraph.style.backgroundColor = isDarkTheme ? '#333' : '#ffffff';
    }
    
    // Update bar colors if they're not already highlighted
    document.querySelectorAll('.bar').forEach(bar => {
        if (bar.style.backgroundColor !== 'orange' && 
            bar.style.backgroundColor !== 'limegreen' && 
            bar.style.backgroundColor !== 'green') {
            bar.style.backgroundColor = "#00d4b5";
        }
        
        // Update the text color of the bar labels
        const span = bar.querySelector('span');
        if (span) {
            span.style.color = isDarkTheme ? 'white' : '#1e1e1e';
        }
    });
}

// Attach event listener to theme dropdown
const themeSelect = document.getElementById('theme');
themeSelect.addEventListener('change', updateSortingGraphTheme);

// Call once on load
updateSortingGraphTheme();

updateArraySize(document.getElementById('size').value);
updateCurrentInputDisplay();

async function compareAllSorts() {
    const algorithms = [
        { name: "Bubble Sort", func: bubbleSort, complexity: "O(n^2)" },
        { name: "Selection Sort", func: selectionSort, complexity: "O(n^2)" },
        { name: "Insertion Sort", func: insertionSort, complexity: "O(n^2)" },
        { name: "Merge Sort", func: mergeSort, complexity: "O(n log n)" },
        { name: "Quick Sort", func: quickSort, complexity: "O(n log n)" },
        { name: "Heap Sort", func: heapSort, complexity: "O(n log n)" },
        { name: "Radix Sort", func: radixSort, complexity: "O(nk)" }
    ];

    const originalArray = [...array]; // Preserve the original array
    const tableBody = document.querySelector("#comparisonTable tbody");
    tableBody.innerHTML = ""; // Clear previous results
    
    const comparisonData = [];

    for (const algorithm of algorithms) {
        const data = [...originalArray]; // Copy the array for each algorithm
        comparisons = 0; // Reset comparisons
        const t0 = performance.now();
        await algorithm.func(data); // Run the sorting algorithm
        const t1 = performance.now();
        const timeTaken = (t1 - t0).toFixed(2);

        // Store the comparison data
        comparisonData.push({
            name: algorithm.name,
            comparisons: comparisons,
            complexity: algorithm.complexity,
            timeTaken: parseFloat(timeTaken)
        });

        // Add a row to the comparison table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${algorithm.name}</td>
            <td>${comparisons}</td>
            <td>${algorithm.complexity}</td>
            <td>${timeTaken}</td>
        `;
        tableBody.appendChild(row);
    }

    // Create and display the comparison chart
    createComparisonChart(comparisonData);
    
    // Determine and display the best algorithm
    determineBestAlgorithm(comparisonData);
    
    // Show the graph container
    document.getElementById('comparisonGraphContainer').style.display = 'block';

    // Restore the original array
    array = [...originalArray];
    drawBars("originalGraph", array);
    drawBars("sortingGraph", array);
}

function createComparisonChart(data) {
    // Destroy previous chart if it exists
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Prepare data for the chart
    const algorithmNames = data.map(item => item.name);
    const comparisonCounts = data.map(item => item.comparisons);
    const timeTakens = data.map(item => item.timeTaken);
    
    // Create the chart
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithmNames,
            datasets: [
                {
                    label: 'Number of Comparisons',
                    data: comparisonCounts,
                    backgroundColor: 'rgba(0, 212, 181, 0.7)',
                    borderColor: 'rgba(0, 212, 181, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Time Taken (ms)',
                    data: timeTakens,
                    backgroundColor: 'rgba(138, 43, 226, 0.7)',
                    borderColor: 'rgba(138, 43, 226, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Number of Comparisons'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Time Taken (ms)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Sorting Algorithm Comparison',
                    color: isDarkTheme ? '#ffffff' : '#1e1e1e',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    labels: {
                        color: isDarkTheme ? '#ffffff' : '#1e1e1e'
                    }
                }
            }
        }
    });
}

function determineBestAlgorithm(data) {
    // Find the algorithm with the lowest time taken
    const fastestAlgorithm = data.reduce((prev, current) => 
        (prev.timeTaken < current.timeTaken) ? prev : current
    );
    
    // Find the algorithm with the fewest comparisons
    const fewestComparisonsAlgorithm = data.reduce((prev, current) => 
        (prev.comparisons < current.comparisons) ? prev : current
    );
    
    // Determine the best overall algorithm (prioritizing time taken)
    const bestAlgorithm = fastestAlgorithm;
    
    // Update the best algorithm display
    document.getElementById('bestAlgorithmName').textContent = bestAlgorithm.name;
    
    let reason = `Fastest algorithm with ${bestAlgorithm.timeTaken}ms execution time.`;
    if (bestAlgorithm === fewestComparisonsAlgorithm) {
        reason += ` Also performed the fewest comparisons (${bestAlgorithm.comparisons}).`;
    } else {
        reason += ` Algorithm with fewest comparisons was ${fewestComparisonsAlgorithm.name} (${fewestComparisonsAlgorithm.comparisons}).`;
    }
    
    document.getElementById('bestAlgorithmReason').textContent = reason;
}

function toggleTheme() {
    const body = document.body;
    const themeToggleButton = document.getElementById("themeToggleButton");

    isDarkTheme = !isDarkTheme;
    
    if (!isDarkTheme) {
        // Switch to light theme
        body.classList.add('light-theme');
        body.style.backgroundColor = "#f4f4f4";
        body.style.color = "#1e1e1e";
        themeToggleButton.textContent = "Switch to Dark Theme";
        
        // Update input elements
        document.querySelectorAll('input, select').forEach(el => {
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#1e1e1e";
            el.style.borderColor = "#00d4b5";
        });
        
        // Update bars in the graph
        document.querySelectorAll('.bar').forEach(bar => {
            if (bar.style.backgroundColor !== 'orange' && 
                bar.style.backgroundColor !== 'limegreen' && 
                bar.style.backgroundColor !== 'green') {
                bar.style.backgroundColor = "#00d4b5";
            }
        });
        
        // Update bar labels
        document.querySelectorAll('.bar span').forEach(span => {
            span.style.color = "#1e1e1e";
        });
        
        // Update description boxes
        document.querySelectorAll('.description, .sBox, .custom-input-container').forEach(el => {
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#1e1e1e";
        });
        
        // Update buttons
        document.querySelectorAll('.sort-button').forEach(button => {
            if (button.id !== "resetButton") {
                button.style.backgroundColor = "#00d4b5";
                button.style.color = "white";
            }
        });
    } else {
        // Switch to dark theme
        body.classList.remove('light-theme');
        body.style.backgroundColor = "#1e1e1e";
        body.style.color = "#f4f4f4";
        themeToggleButton.textContent = "Switch to Light Theme";
        
        // Update input elements
        document.querySelectorAll('input, select').forEach(el => {
            el.style.backgroundColor = "#444";
            el.style.color = "white";
            el.style.borderColor = "#00d4b5";
        });
        
        // Update bars in the graph
        document.querySelectorAll('.bar').forEach(bar => {
            if (bar.style.backgroundColor !== 'orange' && 
                bar.style.backgroundColor !== 'limegreen' && 
                bar.style.backgroundColor !== 'green') {
                bar.style.backgroundColor = "#00d4b5";
            }
        });
        
        // Update bar labels
        document.querySelectorAll('.bar span').forEach(span => {
            span.style.color = "white";
        });
        
        // Update description boxes
        document.querySelectorAll('.description').forEach(el => {
            el.style.backgroundColor = "#2b2b2b";
            el.style.color = "#f4f4f4";
        });
        
        document.querySelectorAll('.sBox, .custom-input-container').forEach(el => {
            el.style.backgroundColor = "#2b2b2b";
            el.style.color = "#f4f4f4";
        });
        
        // Update buttons
        document.querySelectorAll('.sort-button').forEach(button => {
            if (button.id !== "resetButton") {
                button.style.backgroundColor = "#00d4b5";
                button.style.color = "white";
            }
        });
    }
    
    // Update graph boxes
    const graphBoxes = document.querySelectorAll('.graph-box');
    graphBoxes.forEach(box => {
        box.style.backgroundColor = isDarkTheme ? "#333" : "#ffffff";
    });
    
    // If comparison chart exists, update it for the new theme
    if (comparisonChart) {
        comparisonChart.options.plugins.title.color = isDarkTheme ? '#ffffff' : '#1e1e1e';
        comparisonChart.options.plugins.legend.labels.color = isDarkTheme ? '#ffffff' : '#1e1e1e';
        comparisonChart.options.scales.x.grid.color = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        comparisonChart.options.scales.y.grid.color = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        comparisonChart.update();
    }
    
    // Update the sorting graph theme
    updateSortingGraphTheme();
}

function resetArray() {
    // Reset the sorted array and sorted value to the original input
    drawBars('originalGraph', array); // Redraw the original input array
    drawBars('sortingGraph', array); // Reset the sorted graph to match the original input

    // Update the displayed values
    document.getElementById('currentInputArray').textContent = array.join(', ');
    document.getElementById('sortedValueArray').textContent = array.join(', ');

    // Reset any sorting-related states
    isSorting = false;
    comparisons = 0;

    // Clear sorting metrics
    document.getElementById("comparisons").innerText = "0";
    document.getElementById("time-complexity").innerText = "-";
    document.getElementById("time-taken").innerText = "0";

    // Hide step explanation
    hideStepExplanation();
}

function handleRandomInputChange() {
    const randomInput = document.getElementById("randomInput").value;

    // Enable or disable the "Generate" button based on the selection
    const generateButton = document.querySelector(".random-input-container button");
    generateButton.disabled = randomInput === "none";
}

function generateRandomInput() {
    const randomInput = document.getElementById("randomInput").value;
    const size = document.getElementById("size") ? parseInt(document.getElementById("size").value) : 20; // Default size is 20

    switch (randomInput) {
        case "random":
            array = Array.from({ length: size }, () => Math.floor(Math.random() * 90 + 10 + Date.now() % 100));
            break;
        case "ascending":
            array = Array.from({ length: size }, (_, i) => i + 1);
            break;
        case "descending":
            array = Array.from({ length: size }, (_, i) => size - i);
            break;
        case "sorted":
            array = Array.from({ length: size }, () => Math.floor(Math.random() * 90 + 10)).sort((a, b) => a - b);
            break;
        default:
            console.error("Invalid input type selected");
            return;
    }

    // Update heights before drawing bars
    updateGraphBoxHeights();
    drawBars("originalGraph", array);
    drawBars("sortingGraph", array);
    updateCurrentInputDisplay();
}

// Simplified intro slide handling
function hideIntroSlide() {
    const introSlide = document.getElementById('introSlide');
    if (introSlide) {
        introSlide.style.opacity = '0';
        setTimeout(() => {
            introSlide.style.display = 'none';
        }, 800);
        
        // Set flag in localStorage so intro doesn't show on refresh
        localStorage.setItem('hasSeenIntro', 'true');
    }
}

// Initialize everything when the window loads
window.onload = function() {
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    const introSlide = document.getElementById('introSlide');
    
    if (!hasSeenIntro && introSlide) {
        // Show the intro slide
        introSlide.style.display = 'flex';
        introSlide.style.opacity = '1';
        
        // Add click handler to the start button
        const startButton = document.getElementById('startButton');
        if (startButton) {
            // Remove any existing event listeners
            startButton.onclick = null;
            
            // Add a fresh click handler
            startButton.onclick = hideIntroSlide;
        }
    } else if (introSlide) {
        // User has seen intro before, hide it immediately
        introSlide.style.display = 'none';
    }
    
    // Initialize other parts of the application
    updateArraySize(document.getElementById('size').value);
    updateCurrentInputDisplay();
    
    // Other initialization code...
};
