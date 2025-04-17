"use client";
import React, { useState, useCallback } from "react";
import './globals.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div className="error">Something went wrong.</div>;
    }
    return this.props.children;
  }
}

const instantiateWasm = async (wasmBuffer) => {
  try {
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const imports = {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
      }
    };
    return await WebAssembly.instantiate(wasmModule, imports);
  } catch (error) {
    console.error("WASM instantiation failed:", error);
    throw error;
  }
};

const getRelatedContent = (topicTitle) => {
  const resources = {
    "C Fundamentals": [
      {
        title: "C Programming Absolute Beginner's Guide",
        type: "book",
        url: "https://www.amazon.com/Programming-Absolute-Beginners-Guide-3rd/dp/0789751984"
      },
      {
        title: "Learn C Programming - Codecademy",
        type: "course",
        url: "https://www.codecademy.com/learn/learn-c"
      },
      {
        title: "C Programming Tutorial - GeeksforGeeks",
        type: "tutorial",
        url: "https://www.geeksforgeeks.org/c-programming-language/"
      }
      ],
      "Pointers & Memory": [
        {
          title: "Pointers in C - GeeksforGeeks",
          type: "tutorial",
          url: "https://www.geeksforgeeks.org/pointers-in-c-and-c-set-1-introduction-arithmetic-and-array/"
        },
        {
          title: "Memory Management in C - JournalDev",
          type: "article",
          url: "https://www.journaldev.com/31907/memory-management-in-c"
        }
      ],
      "Arrays & Strings": [
        {
          title: "Arrays in C - Programiz",
          type: "tutorial",
          url: "https://www.programiz.com/c-programming/c-arrays"
        },
        {
          title: "String Handling in C - GeeksforGeeks",
          type: "tutorial",
          url: "https://www.geeksforgeeks.org/strings-in-c-2/"
        }
      ],
      "Structures & Unions": [
        {
          title: "Structures in C - Javatpoint",
          type: "tutorial",
          url: "https://www.javatpoint.com/structure-in-c"
        }
      ],
      "File Handling": [
        {
          title: "File I/O in C - TutorialsPoint",
          type: "tutorial",
          url: "https://www.tutorialspoint.com/cprogramming/c_file_io.htm"
        }
      ],
      "Linked Lists": [
        {
          title: "Linked Lists in C - Programiz",
          type: "tutorial",
          url: "https://www.programiz.com/dsa/linked-list"
        }
      ],
      "Trees": [
        {
          title: "Binary Trees in C - GeeksforGeeks",
          type: "tutorial",
          url: "https://www.geeksforgeeks.org/binary-tree-data-structure/"
        }
      ],
      "Graphs": [
        {
          title: "Graph Data Structure - Programiz",
          type: "tutorial",
          url: "https://www.programiz.com/dsa/graph"
        }
      ]
    };  
  
  return resources[topicTitle] || [
    {
      title: `${topicTitle} Resources`,
      type: "general",
      url: "https://www.google.com/search?q=" + encodeURIComponent(`C programming ${topicTitle}`)
    }
  ];
};

function MainComponent() {
  const [activeSection, setActiveSection] = useState("roadmap");
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [codeOutput, setCodeOutput] = useState("");
  const [runningCode, setRunningCode] = useState(false);
  const [wasmModule, setWasmModule] = useState(null);

  const [topics, setTopics] = useState([
    {
      title: "C Fundamentals",
      duration: "3 weeks",
      content: "Basic syntax, data types, variables, operators, control flow (if-else, loops), functions, and basic I/O operations in C programming.",
      difficulty: "Beginner",
      code: `#include <stdio.h>\n\nint main() {\n    // Variables and data types\n    int age = 25;\n    float height = 5.9;\n    char grade = 'A';\n    \n    // Basic I/O\n    printf("Enter your name: ");\n    char name[50];\n    scanf("%s", name);\n    \n    // Control flow\n    if (age >= 18) {\n        printf("%s, you are an adult.\\n", name);\n    } else {\n        printf("%s, you are a minor.\\n", name);\n    }\n    \n    // Loops\n    for (int i = 1; i <= 5; i++) {\n        printf("%d ", i);\n    }\n    \n    return 0;\n}`,
      notes: "C is a procedural programming language that provides low-level access to memory and requires explicit memory management.",
      questions: [
        {
          question: "Which header file is needed for printf() and scanf()?",
          options: ["stdio.h", "stdlib.h", "math.h", "string.h"],
          correctAnswer: "stdio.h"
        },
        {
          question: "What is the size of 'int' data type in C?",
          options: ["2 bytes", "4 bytes", "Depends on compiler", "8 bytes"],
          correctAnswer: "Depends on compiler"
        }
      ],
      detailedContent: {
        overview: "C is a general-purpose programming language that supports structured programming, recursion, and low-level memory manipulation.",
        keyConcepts: [
          {
            concept: "Variables and data types",
            link: "https://www.tutorialspoint.com/cprogramming/c_variables.htm"
          },
          {
            concept: "Operators and expressions",
            link: "https://www.programiz.com/c-programming/c-operators"
          },
          {
            concept: "Control structures",
            link: "https://www.w3schools.in/c-programming/decision-making"
          },
          {
            concept: "Functions and scope",
            link: "https://www.learn-c.org/en/Functions"
          },
          {
            concept: "Basic input/output",
            link: "https://www.geeksforgeeks.org/basic-input-and-output-in-c/"
          }
        ],
        applications: [
          {
            application: "System programming",
            link: "https://www.geeksforgeeks.org/system-programming-in-c/"
          },
          {
            application: "Embedded systems",
            link: "https://www.embedded.com/why-c-is-still-the-best-language-for-embedded-systems/"
          },
          {
            application: "Game development",
            link: "https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/c-from-scratch-r3173/"
          },
          {
            application: "Compiler design",
            link: "https://www.tutorialspoint.com/compiler_design/index.htm"
          }
        ]
      }
    },
    {
      title: "Pointers & Memory",
      duration: "4 weeks",
      content: "Pointer variables, pointer arithmetic, dynamic memory allocation (malloc, calloc, free), pointer to pointer, function pointers, and memory management techniques.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int var = 20;\n    int *ptr = &var;\n    \n    printf("Value of var: %d\\n", var);\n    printf("Address of var: %p\\n", &var);\n    printf("Value of ptr: %p\\n", ptr);\n    printf("Value pointed by ptr: %d\\n", *ptr);\n    \n    // Dynamic memory allocation\n    int *arr = (int*)malloc(5 * sizeof(int));\n    for (int i = 0; i < 5; i++) {\n        arr[i] = i * 10;\n    }\n    \n    // Function pointer\n    void (*print)(int) = &printf;\n    print("Function pointer example\\n");\n    \n    free(arr);\n    return 0;\n}`,
      notes: "Pointers store memory addresses and enable direct memory manipulation, which is powerful but requires careful management to avoid issues like memory leaks.",
      questions: [
        {
          question: "What does the '&' operator do?",
          options: ["Logical AND", "Bitwise AND", "Address of", "Dereference"],
          correctAnswer: "Address of"
        },
        {
          question: "Which function is used to free dynamically allocated memory?",
          options: ["delete", "remove", "free", "release"],
          correctAnswer: "free"
        }
      ],
      detailedContent: {
        overview: "Pointers are variables that store memory addresses, enabling direct memory access and manipulation.",
        keyConcepts: [
          {
            title: "Pointer declaration and initialization",
            link: "https://www.geeksforgeeks.org/pointers-in-c-and-c-set-1-introduction-arithmetic-and-array/"
          },
          {
            title: "Pointer arithmetic",
            link: "https://www.programiz.com/c-programming/c-pointers-arithmetic"
          },
          {
            title: "Dynamic memory allocation",
            link: "https://www.tutorialspoint.com/c_standard_library/c_function_malloc.htm"
          },
          {
            title: "Function pointers",
            link: "https://www.geeksforgeeks.org/function-pointer-in-c/"
          },
          {
            title: "Memory management best practices",
            link: "https://aticleworld.com/memory-management-in-c/"
          }
        ],
        applications: [
          {
            title: "Data structures implementation",
            link: "https://www.geeksforgeeks.org/bit-manipulation-techniques/"
          },
          {
            title: "Data structures with Bitmasking",
            link: "https://www.hackerearth.com/practice/notes/bitmasking-and-subsets/"
          },
          {
            title: "System programming (Linux Journal)",
            link: "https://www.linuxjournal.com/article/10382"
          },
          {
            title: "System Programming Course (UIUC CS 241)",
            link: "https://cs241.cs.illinois.edu/"
          },
          {
            title: "Memory-efficient programming (TopCoder)",
            link: "https://www.topcoder.com/thrive/articles/Memory%20Efficient%20Programming"
          },
          {
            title: "Bit Manipulation Space Tricks (LeetCode)",
            link: "https://leetcode.com/discuss/general-discussion/1125778/Space-Optimized-Bit-Manipulation-Tricks"
          },
          {
            title: "Callback with Bitmask Flags (Stack Overflow)",
            link: "https://stackoverflow.com/questions/19077563/bitmask-callbacks-in-c"
          },
          {
            title: "Task Notifications & Callbacks (FreeRTOS)",
            link: "https://www.freertos.org/RTOS-task-notifications.html"
          }
        ]        
      }
    },
    {
      title: "Arrays & Strings",
      duration: "4 weeks",
      content: "Single and multi-dimensional arrays, array manipulation techniques, dynamic memory allocation, string operations (strlen, strcpy, strcat), string parsing and manipulation, array sorting and searching algorithms.",
      difficulty: "Beginner",
      code: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    // Array example\n    int numbers[5] = {10, 20, 30, 40, 50};\n    for (int i = 0; i < 5; i++) {\n        printf("numbers[%d] = %d\\n", i, numbers[i]);\n    }\n    \n    // String example\n    char greeting[20] = "Hello";\n    strcat(greeting, " World!");\n    printf("%s\\n", greeting);\n    printf("Length: %zu\\n", strlen(greeting));\n    \n    // 2D array\n    int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    for (int i = 0; i < 2; i++) {\n        for (int j = 0; j < 3; j++) {\n            printf("%d ", matrix[i][j]);\n        }\n        printf("\\n");\n    }\n    \n    return 0;\n}`,
      notes: "Arrays are fundamental data structures that store elements of the same type in contiguous memory locations. They provide constant-time access to elements using indices.",
      questions: [
        {
          question: "What is the time complexity of accessing an element in an array?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
          correctAnswer: "O(1)"
        },
        {
          question: "Which function copies one string to another?",
          options: ["strlen", "strcpy", "strcat", "strcmp"],
          correctAnswer: "strcpy"
        }
      ],
      detailedContent: {
        overview: "Arrays are collections of elements of the same type stored in contiguous memory locations. Strings in C are essentially arrays of characters terminated by a null character '\\0'.",
        keyConcepts: [
          {
            title: "Declaration and initialization of arrays",
            link: "https://www.geeksforgeeks.org/arrays-in-c-cpp/"
          },
          {
            title: "Accessing array elements using indices",
            link: "https://www.tutorialspoint.com/cprogramming/c_arrays.htm"
          },
          {
            title: "Multidimensional arrays",
            link: "https://www.geeksforgeeks.org/multidimensional-arrays-c-cpp/"
          },
          {
            title: "Array bounds and memory allocation",
            link: "https://www.geeksforgeeks.org/memory-layout-of-c-program/"
          },
          {
            title: "String manipulation functions",
            link: "https://www.geeksforgeeks.org/c-library-string-h/"
          }
        ],
        applications: [
          {
            title: "Storing and processing large datasets",
            link: "https://towardsdatascience.com/handling-large-datasets-in-python-using-generators-and-other-tricks-3c3f262b9bda"
          },
          {
            title: "Using Arrays for Large Data Processing (GeeksForGeeks)",
            link: "https://www.geeksforgeeks.org/array-data-structure/"
          },
          {
            title: "Implementing other data structures",
            link: "https://www.geeksforgeeks.org/data-structures/"
          },
          {
            title: "Array-based Implementation of Stacks and Queues",
            link: "https://www.programiz.com/dsa/stack"
          },
          {
            title: "Matrix operations",
            link: "https://www.geeksforgeeks.org/matrix-in-c/"
          },
          {
            title: "Matrix Multiplication in C",
            link: "https://www.programiz.com/c-programming/examples/matrix-multiplication"
          },
          {
            title: "Buffer storage in I/O operations",
            link: "https://www.ibm.com/docs/en/zos/2.4.0?topic=methods-buffered-i-o"
          },
          {
            title: "C Buffered I/O Functions",
            link: "https://www.tutorialspoint.com/c_standard_library/stdio_h.htm"
          }
        ]        
      }
    },
    {
      title: "Structures & Unions",
      duration: "3 weeks",
      content: "Structure declaration and initialization, nested structures, structure pointers, typedef, unions, bit fields, and practical applications of structures in C programming.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>\n#include <string.h>\n\ntypedef struct {\n    char name[50];\n    int age;\n    float gpa;\n} Student;\n\nunion Data {\n    int i;\n    float f;\n    char str[20];\n};\n\nint main() {\n    // Structure example\n    Student s1;\n    strcpy(s1.name, "Alice");\n    s1.age = 20;\n    s1.gpa = 3.8;\n    \n    printf("Student: %s, %d, %.2f\\n", s1.name, s1.age, s1.gpa);\n    \n    // Union example\n    union Data data;\n    data.i = 10;\n    printf("data.i: %d\\n", data.i);\n    \n    data.f = 3.14;\n    printf("data.f: %.2f\\n", data.f);\n    \n    return 0;\n}`,
      notes: "Structures allow grouping of different data types under a single name, while unions share the same memory space for all members, saving memory when only one member is needed at a time.",
      questions: [
        {
          question: "What is the main difference between structures and unions?",
          options: [
            "Structures have fixed size, unions don't",
            "Unions share memory for all members",
            "Structures can't contain pointers",
            "Unions can't be nested"
          ],
          correctAnswer: "Unions share memory for all members"
        },
        {
          question: "What does typedef do?",
          options: [
            "Defines a new data type",
            "Creates an alias for a type",
            "Allocates memory",
            "Declares a variable"
          ],
          correctAnswer: "Creates an alias for a type"
        }
      ],
      detailedContent: {
        overview: "Structures and unions are user-defined data types that allow combining data items of different kinds.",
        keyConcepts: [
          {
            title: "Structure declaration and initialization",
            link: "https://www.geeksforgeeks.org/structures-c/"
          },
          {
            title: "Structure pointers",
            link: "https://www.geeksforgeeks.org/pointer-to-structure-in-c/"
          },
          {
            title: "typedef keyword",
            link: "https://www.geeksforgeeks.org/typedef-keyword-in-c/"
          },
          {
            title: "Union memory allocation",
            link: "https://www.geeksforgeeks.org/union-in-c/"
          },
          {
            title: "Bit fields in structures",
            link: "https://www.geeksforgeeks.org/bit-fields-c/"
          }
        ],
        applications: [
          {
            title: "Database record representation",
            link: "https://www.geeksforgeeks.org/structure-member-alignment-padding-and-data-packing/"
          },
          {
            title: "File format handling",
            link: "https://www.geeksforgeeks.org/c-program-to-create-a-file-in-c/"
          },
          {
            title: "Binary File Structures in C",
            link: "https://www.tutorialspoint.com/c-program-to-write-and-read-structured-data-into-a-file"
          },
          {
            title: "Hardware register mapping",
            link: "https://embeddedartistry.com/blog/2017/12/27/a-case-for-using-volatile-in-embedded-c/"
          },
          {
            title: "Memory-efficient data storage",
            link: "https://www.geeksforgeeks.org/structures-c/"
          },
          {
            title: "Bitfields in Structures (for Compact Storage)",
            link: "https://www.programiz.com/c-programming/bit-fields"
          }
        ]        
      }
    },
    {
      title: "File Handling",
      duration: "3 weeks",
      content: "File operations in C (fopen, fclose, fread, fwrite), text vs binary files, file positioning (fseek, ftell), error handling, and practical file manipulation techniques.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>\n\nint main() {\n    FILE *file;\n    char data[100];\n    \n    // Writing to a file\n    file = fopen("example.txt", "w");\n    if (file == NULL) {\n        printf("Error opening file!\\n");\n        return 1;\n    }\n    fprintf(file, "This is a file handling example.\\n");\n    fclose(file);\n    \n    // Reading from a file\n    file = fopen("example.txt", "r");\n    if (file == NULL) {\n        printf("Error opening file!\\n");\n        return 1;\n    }\n    \n    while (fgets(data, sizeof(data), file) != NULL) {\n        printf("%s", data);\n    }\n    \n    fclose(file);\n    return 0;\n}`,
      notes: "File handling in C allows programs to store data persistently and retrieve it later, with functions for both text and binary file operations.",
      questions: [
        {
          question: "Which mode opens a file for both reading and writing?",
          options: ["r", "w", "a", "r+"],
          correctAnswer: "r+"
        },
        {
          question: "Which function is used to move the file pointer?",
          options: ["fseek", "ftell", "fgetpos", "rewind"],
          correctAnswer: "fseek"
        }
      ],
      detailedContent: {
        overview: "File handling in C provides functions to create, read, update and delete files on the filesystem.",
        keyConcepts: [
          {
            title: "File opening modes",
            link: "https://www.geeksforgeeks.org/file-handling-c-classes-open-close-read-write/"
          },
          {
            title: "Text vs binary files",
            link: "https://www.geeksforgeeks.org/difference-between-text-file-and-binary-file/"
          },
          {
            title: "File positioning",
            link: "https://www.geeksforgeeks.org/fseek-in-c/"
          },
          {
            title: "Error handling",
            link: "https://www.geeksforgeeks.org/error-handling-c-programming/"
          },
          {
            title: "File operations",
            link: "https://www.programiz.com/c-programming/c-file-input-output"
          }
        ],
        applications: [
          {
            title: "Data persistence",
            link: "https://www.geeksforgeeks.org/file-handling-c-create-open-read-write-and-close-a-file/"
          },
          {
            title: "Configuration files",
            link: "https://stackoverflow.com/questions/3512917/how-to-read-a-config-file-in-c"
          },
          {
            title: "Logging systems",
            link: "https://aticleworld.com/create-a-log-file-in-c/"
          },
          {
            title: "Data import/export",
            link: "https://www.tutorialspoint.com/c_standard_library/c_function_fscanf.htm"
          }
        ]        
      }
    },
    {
      title: "Linked Lists",
      duration: "4 weeks",
      content: "Singly linked lists, doubly linked lists, circular linked lists, operations (insertion, deletion, traversal), memory management with pointers, list reversal, and merging techniques.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>\n#include <stdlib.h>\nstruct Node {\n    int data;\n    struct Node* next;\n};\nvoid printList(struct Node* n) {\n    while (n != NULL) {\n        printf("%d -> ", n->data);\n        n = n->next;\n    }\n    printf("NULL\\n");\n}\nint main() {\n    struct Node* head = NULL;\n    struct Node* second = NULL;\n    struct Node* third = NULL;\n    head = (struct Node*)malloc(sizeof(struct Node));\n    second = (struct Node*)malloc(sizeof(struct Node));\n    third = (struct Node*)malloc(sizeof(struct Node));\n    head->data = 1; head->next = second;\n    second->data = 2; second->next = third;\n    third->data = 3; third->next = NULL;\n    printList(head);\n    return 0;\n}`,
      notes: "Linked Lists are dynamic data structures where elements are stored in nodes, each containing data and a reference to the next node. They excel at insertions and deletions.",
      questions: [
        {
          question: "What is the main advantage of a linked list over an array?",
          options: ["Dynamic size", "Constant time access", "Less memory usage", "Faster sorting"],
          correctAnswer: "Dynamic size",
        },
        {
          question: "What is stored in each node of a singly linked list?",
          options: ["Data and next pointer", "Only data", "Two pointers", "Previous and next pointers"],
          correctAnswer: "Data and next pointer",
        },
      ],
      detailedContent: {
        overview: "Linked lists are linear data structures where each element is a separate object linked using pointers.",
        keyConcepts: [
          {
            title: "Node structure",
            link: "https://www.geeksforgeeks.org/data-structures/linked-list/singly-linked-list/"
          },
          {
            title: "Memory allocation",
            link: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/"
          },
          {
            title: "Insertion/deletion operations",
            link: "https://www.geeksforgeeks.org/insertion-in-linked-list/"
          },
          {
            title: "Traversal techniques",
            link: "https://www.geeksforgeeks.org/linked-list-set-2-inserting-a-node/"
          },
          {
            title: "List variations",
            link: "https://www.geeksforgeeks.org/types-of-linked-list/"
          }
        ],
        applications: [
          {
            title: "Dynamic memory allocation",
            link: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/"
          },
          {
            title: "Implementing stacks/queues",
            link: "https://www.programiz.com/dsa/stack"
          },
          {
            title: "Memory-efficient data storage",
            link: "https://www.geeksforgeeks.org/data-structures/#efficientDS"
          },
          {
            title: "Undo functionality",
            link: "https://stackoverflow.com/questions/28716553/how-to-implement-undo-redo-feature-in-c"
          }
        ]        
      }
    },
    {
      title: "Stacks & Queues",
      duration: "3 weeks",
      content: "Stack implementation (array/linked list), operations (push, pop, peek), applications (expression evaluation, parenthesis matching), queue variations (circular, priority), deque implementation.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>\n#define MAX 5\nint stack[MAX], top = -1;\nvoid push(int value) {\n    if (top == MAX - 1) {\n        printf("Stack Overflow\\n");\n        return;\n    }\n    stack[++top] = value;\n}\nint pop() {\n    if (top == -1) {\n        printf("Stack Underflow\\n");\n        return -1;\n    }\n    return stack[top--];\n}\n\n#include <stdio.h>\n#define MAX 5\nint queue[MAX], front = -1, rear = -1;\nvoid enqueue(int value) {\n    if (rear == MAX - 1) {\n        printf("Queue Overflow\\n");\n        return;\n    }\n    if (front == -1) front = 0;\n    queue[++rear] = value;\n}\nint dequeue() {\n    if (front == -1 || front > rear) {\n        printf("Queue Underflow\\n");\n        return -1;\n    }\n    return queue[front++];\n}`,
      notes: "Stacks follow LIFO (Last In First Out) principle, while Queues follow FIFO (First In First Out). Both are essential for various algorithms and applications.",
      questions: [
        {
          question: "What principle does a stack follow?",
          options: ["LIFO", "FIFO", "Random Access", "Priority Based"],
          correctAnswer: "LIFO",
        },
        {
          question: "Which operation is not typically found in a queue?",
          options: ["Peek", "Push", "Enqueue", "Dequeue"],
          correctAnswer: "Push",
        },
      ],
      detailedContent: {
        overview: "Stacks and queues are abstract data types that differ in their element access patterns.",
        keyConcepts: [
          {
            title: "LIFO vs FIFO",
            link: "https://www.geeksforgeeks.org/difference-between-stack-and-queue-data-structures/"
          },
          {
            title: "Array vs linked implementation",
            link: "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/"
          },
          {
            title: "Basic operations",
            link: "https://www.geeksforgeeks.org/stack-set-2-infix-to-postfix/"
          },
          {
            title: "Common applications",
            link: "https://www.geeksforgeeks.org/stack-data-structure/#applications"
          },
          {
            title: "Variations",
            link: "https://www.geeksforgeeks.org/types-of-queues-in-data-structure/"
          }
        ],
        applications: [
          {
            title: "Function call stack",
            link: "https://www.geeksforgeeks.org/stack-data-structure/#use"
          },
          {
            title: "Expression evaluation",
            link: "https://www.geeksforgeeks.org/stack-set-4-evaluation-postfix-expression/"
          },
          {
            title: "Job scheduling",
            link: "https://www.geeksforgeeks.org/stack-based-job-scheduling/"
          },
          {
            title: "Breadth-first search",
            link: "https://www.programiz.com/dsa/graph-bfs"
          }
        ]        
      }
    },
    {
      title: "Trees",
      duration: "5 weeks",
      content: "Binary trees, binary search trees, tree traversals (in-order, pre-order, post-order), AVL trees, tree balancing, height calculations, and tree operations (insertion, deletion, searching).",
      difficulty: "Advanced",
      code: `#include <stdio.h>\n#include <stdlib.h>\nstruct Node {\n    int data;\n    struct Node* left;\n    struct Node* right;\n};\nstruct Node* newNode(int data) {\n    struct Node* node = (struct Node*)malloc(sizeof(struct Node));\n    node->data = data;\n    node->left = node->right = NULL;\n    return node;\n}\nvoid inOrder(struct Node* root) {\n    if (root != NULL) {\n        inOrder(root->left);\n        printf("%d ", root->data);\n        inOrder(root->right);\n    }\n}`,
      notes: "Trees are hierarchical data structures with a root node and subtrees. Binary Search Trees maintain ordered data for efficient searching and sorting.",
      questions: [
        {
          question: "What is the maximum number of children in a binary tree?",
          options: ["2", "1", "3", "Unlimited"],
          correctAnswer: "2",
        },
        {
          question: "Which traversal visits the root node first?",
          options: ["Pre-order", "In-order", "Post-order", "Level-order"],
          correctAnswer: "Pre-order",
        },
      ],
      detailedContent: {
        overview: "Trees are non-linear data structures that represent hierarchical relationships between elements.",
        keyConcepts: [
          {
            title: "Tree terminology",
            link: "https://www.geeksforgeeks.org/basics-tree-data-structure/"
          },
          {
            title: "Binary tree properties",
            link: "https://www.geeksforgeeks.org/properties-of-binary-tree/"
          },
          {
            title: "Traversal algorithms",
            link: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/"
          },
          {
            title: "Balancing techniques",
            link: "https://www.geeksforgeeks.org/self-balanced-binary-search-trees/"
          },
          {
            title: "Search operations",
            link: "https://www.geeksforgeeks.org/binary-search-tree-set-1-search-and-insertion/"
          }
        ],
        applications: [
          {
            title: "File systems",
            link: "https://www.geeksforgeeks.org/tree-data-structure-for-file-system/"
          },
          {
            title: "Database indexing",
            link: "https://www.geeksforgeeks.org/indexing-in-databases-set-1/"
          },
          {
            title: "Decision trees",
            link: "https://www.geeksforgeeks.org/decision-tree/"
          },
          {
            title: "Network routing",
            link: "https://www.geeksforgeeks.org/shortest-path-routing-algorithms/"
          }
        ]                
      }
    },
    {
      title: "Graphs",
      duration: "4 weeks",
      content: "Graph representations (adjacency matrix/list), traversal algorithms (BFS/DFS), shortest path algorithms (Dijkstra's), minimum spanning trees, topological sorting.",
      difficulty: "Advanced",
      code: `#include <stdio.h>\n#define V 4\nvoid printMatrix(int graph[V][V]) {\n    for (int i = 0; i < V; i++) {\n        for (int j = 0; j < V; j++) {\n            printf("%d ", graph[i][j]);\n        }\n        printf("\\n");\n    }\n}\nint main() {\n    int graph[V][V] = {\n        {0, 1, 0, 1},\n        {1, 0, 1, 0},\n        {0, 1, 0, 1},\n        {1, 0, 1, 0}\n    };\n    printMatrix(graph);\n    return 0;\n}`,
      notes: "Graphs represent relationships between objects. They can be directed or undirected, weighted or unweighted, and are crucial for network and path-finding algorithms.",
      questions: [
        {
          question: "What is a vertex in a graph?",
          options: ["A node", "An edge", "A path", "A cycle"],
          correctAnswer: "A node",
        },
        {
          question: "Which algorithm finds the shortest path in a weighted graph?",
          options: ["Dijkstra's", "DFS", "BFS", "Prim's"],
          correctAnswer: "Dijkstra's",
        },
      ],
      detailedContent: {
        overview: "Graphs consist of vertices connected by edges, used to model pairwise relationships.",
        keyConcepts: [
          {
            title: "Graph representations",
            link: "https://www.geeksforgeeks.org/graph-representation/"
          },
          {
            title: "Traversal algorithms",
            link: "https://www.geeksforgeeks.org/graph-traversal-algorithms/"
          },
          {
            title: "Shortest path problems",
            link: "https://www.geeksforgeeks.org/shortest-path-algorithms/"
          },
          {
            title: "Connectivity",
            link: "https://www.geeksforgeeks.org/connectivity-in-graph/"
          },
          {
            title: "Special graph types",
            link: "https://www.geeksforgeeks.org/special-types-of-graphs/"
          }
        ],
        applications: [
          {
            title: "Social networks",
            link: "https://www.geeksforgeeks.org/graph-based-approaches-in-social-network-analysis/"
          },
          {
            title: "Transportation systems",
            link: "https://www.geeksforgeeks.org/graph-theory-transportation-problems/"
          },
          {
            title: "Web page ranking",
            link: "https://www.geeksforgeeks.org/google-page-rank-algorithm/"
          },
          {
            title: "Circuit design",
            link: "https://www.geeksforgeeks.org/graph-theory-in-circuit-design/"
          }
        ]         
      }
    },
    {
      title: "Hash Tables",
      duration: "3 weeks",
      content: "Hash function design, collision resolution (chaining, open addressing), load factor analysis, hash table resizing, applications in caching and symbol tables.",
      difficulty: "Advanced",
      code: `#include <stdio.h>\n#include <stdlib.h>\n#define SIZE 10\nstruct Node {\n    int data;\n    struct Node* next;\n};\nstruct Node* hashTable[SIZE];\nint hashFunction(int key) {\n    return key % SIZE;\n}\nvoid insert(int key) {\n    int index = hashFunction(key);\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\n    newNode->data = key;\n    newNode->next = hashTable[index];\n    hashTable[index] = newNode;\n}\nvoid printHashTable() {\n    for (int i = 0; i < SIZE; i++) {\n        struct Node* temp = hashTable[i];\n        printf("Index %d: ", i);\n        while (temp != NULL) {\n            printf("%d -> ", temp->data);\n            temp = temp->next;\n        }\n        printf("NULL\\n");\n    }\n}`,
      notes: "Hash Tables provide constant-time average case complexity for insertions and lookups. They use hash functions to map keys to array indices.",
      questions: [
        {
          question: "What is the purpose of a hash function?",
          options: [
            "Map keys to indices",
            "Sort data",
            "Encrypt data",
            "Compress data",
          ],
          correctAnswer: "Map keys to indices",
        },
        {
          question: "What happens when two keys hash to the same index?",
          options: ["Collision", "Overflow", "Underflow", "Nothing"],
          correctAnswer: "Collision",
        },
      ],
      detailedContent: {
        overview: "Hash tables implement associative arrays that map keys to values using hash functions.",
        keyConcepts: [
          {
            title: "Hash functions",
            link: "https://www.geeksforgeeks.org/hashing-data-structure/"
          },
          {
            title: "Collision resolution",
            link: "https://www.geeksforgeeks.org/collision-resolution-in-hashing/"
          },
          {
            title: "Load factor",
            link: "https://www.geeksforgeeks.org/load-factor-in-hashing/"
          },
          {
            title: "Performance analysis",
            link: "https://www.geeksforgeeks.org/performance-analysis-of-hashing-techniques/"
          },
          {
            title: "Practical considerations",
            link: "https://www.geeksforgeeks.org/practical-considerations-in-hashing/"
          }
        ],
        applications: [
          {
            title: "Database indexing",
            link: "https://www.geeksforgeeks.org/database-indexing/"
          },
          {
            title: "Caching systems",
            link: "https://www.geeksforgeeks.org/what-is-caching/"
          },
          {
            title: "Language interpreters",
            link: "https://www.geeksforgeeks.org/what-is-an-interpreter-in-programming-languages/"
          },
          {
            title: "Cryptography",
            link: "https://www.geeksforgeeks.org/introduction-to-cryptography/"
          }
        ]        
      }
    },
    {
      title: "Memory Management",
      duration: "3 weeks",
      content: "Dynamic memory allocation (malloc, calloc, realloc, free), memory leaks detection, memory debugging tools, memory pools, and best practices for efficient memory usage in C.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Basic memory allocation
    int *arr = (int*)malloc(5 * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed\\n");
        return 1;
    }
    
    // Using allocated memory
    for (int i = 0; i < 5; i++) {
        arr[i] = i * 10;
    }
    
    // Resizing memory
    int *new_arr = (int*)realloc(arr, 10 * sizeof(int));
    if (new_arr == NULL) {
        printf("Memory reallocation failed\\n");
        free(arr);
        return 1;
    }
    arr = new_arr;
    
    // Freeing memory
    free(arr);
    
    // Memory leak example (uncomment to demonstrate)
    // int *leak = (int*)malloc(100 * sizeof(int));
    
    return 0;
}`,
      notes: "Proper memory management is crucial in C to prevent memory leaks and ensure efficient resource usage. Always check for allocation failures and free memory when no longer needed.",
      questions: [
        {
          question: "Which function should be used to allocate memory for an array of elements?",
          options: ["malloc", "calloc", "realloc", "free"],
          correctAnswer: "calloc"
        },
        {
          question: "What is a memory leak?",
          options: [
            "When memory is allocated but never freed",
            "When memory is corrupted",
            "When memory is accessed out of bounds",
            "When memory is fragmented"
          ],
          correctAnswer: "When memory is allocated but never freed"
        }
      ],
      detailedContent: {
        overview: "Memory management in C gives programmers direct control over memory allocation and deallocation, which is powerful but requires careful handling.",
        keyConcepts: [
          {
            title: "Heap vs stack memory",
            link: "https://www.geeksforgeeks.org/difference-between-stack-and-heap-memory-in-c/"
          },
          {
            title: "Dynamic allocation functions",
            link: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c-using-malloc-calloc-free-and-realloc/"
          },
          {
            title: "Memory leak detection",
            link: "https://www.geeksforgeeks.org/how-to-detect-and-prevent-memory-leaks-in-c/"
          },
          {
            title: "Memory debugging tools",
            link: "https://www.geeksforgeeks.org/tools-to-detect-memory-leaks-in-c/"
          },
          {
            title: "Best practices",
            link: "https://www.geeksforgeeks.org/best-practices-for-dynamic-memory-management-in-c/"
          }
        ],
        applications: [
          {
            title: "Dynamic data structures",
            link: "https://www.geeksforgeeks.org/dynamic-memory-allocation-in-c/"
          },
          {
            title: "Large data processing",
            link: "https://www.geeksforgeeks.org/large-scale-data-processing-using-mapreduce/"
          },
          {
            title: "Resource-constrained systems",
            link: "https://www.geeksforgeeks.org/embedded-systems/"
          },
          {
            title: "Performance-critical applications",
            link: "https://www.geeksforgeeks.org/performance-optimization-techniques-in-c/"
          }
        ]        
      }
    },
    {
      title: "Preprocessor & Macros",
      duration: "2 weeks",
      content: "Preprocessor directives (#define, #include, #ifdef, etc.), macro definitions, conditional compilation, predefined macros, and practical uses of the C preprocessor.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>

// Simple macro
#define PI 3.14159

// Function-like macro
#define CIRCLE_AREA(r) (PI * (r) * (r))

// Conditional compilation
#define DEBUG 1

int main() {
    double radius = 5.0;
    double area = CIRCLE_AREA(radius);
    
    printf("Area of circle with radius %.2f: %.2f\\n", radius, area);
    
    #ifdef DEBUG
    printf("Debug information: Calculation performed at %s\\n", __TIME__);
    #endif
    
    // Stringification example
    #define PRINT_VAR(x) printf(#x " = %d\\n", x)
    int test = 42;
    PRINT_VAR(test);
    
    return 0;
}`,
      notes: "The C preprocessor performs text substitution before compilation, enabling code customization, conditional compilation, and macro-based optimizations.",
      questions: [
        {
          question: "What does the #include directive do?",
          options: [
            "Inserts the contents of another file",
            "Defines a macro",
            "Compiles code conditionally",
            "Includes a library at runtime"
          ],
          correctAnswer: "Inserts the contents of another file"
        },
        {
          question: "Why should macro arguments be parenthesized?",
          options: [
            "To ensure proper operator precedence",
            "To make them constants",
            "To improve readability",
            "To enable type checking"
          ],
          correctAnswer: "To ensure proper operator precedence"
        }
      ],
      detailedContent: {
        overview: "The C preprocessor manipulates source code before compilation, providing powerful text substitution and conditional compilation features.",
        keyConcepts: [
          {
            title: "Macro definitions",
            link: "https://www.geeksforgeeks.org/macros-in-c-cpp/"
          },
          {
            title: "Conditional compilation",
            link: "https://www.geeksforgeeks.org/conditional-compilation-in-c-cpp/"
          },
          {
            title: "File inclusion",
            link: "https://www.geeksforgeeks.org/file-inclusion-in-c-using-include-directive/"
          },
          {
            title: "Predefined macros",
            link: "https://www.geeksforgeeks.org/predefined-macros-in-c/"
          },
          {
            title: "Pitfalls and best practices",
            link: "https://www.geeksforgeeks.org/common-pitfalls-in-c/"
          }
        ],
        applications: [
          {
            title: "Platform-specific code",
            link: "https://www.geeksforgeeks.org/portable-vs-platform-specific-code-in-c/"
          },
          {
            title: "Debugging aids",
            link: "https://www.geeksforgeeks.org/debugging-in-c-using-gdb/"
          },
          {
            title: "Code configuration",
            link: "https://www.geeksforgeeks.org/using-makefile-in-c/"
          },
          {
            title: "Performance optimizations",
            link: "https://www.geeksforgeeks.org/optimizing-c-code-for-performance/"
          }
        ]        
      }
    },
    {
      title: "Error Handling",
      duration: "2 weeks",
      content: "Error handling techniques in C including errno, perror, strerror, custom error handling mechanisms, and best practices for robust error management.",
      difficulty: "Intermediate",
      code: `#include <stdio.h>
#include <errno.h>
#include <string.h>

int divide(int a, int b, int *result) {
    if (b == 0) {
        errno = EDOM; // Domain error
        return -1;
    }
    *result = a / b;
    return 0;
}

int main() {
    int result;
    
    // Example 1: Using errno
    FILE *file = fopen("nonexistent.txt", "r");
    if (file == NULL) {
        perror("Error opening file");
        printf("Error details: %s\\n", strerror(errno));
    }
    
    // Example 2: Custom error handling
    if (divide(10, 0, &result) {
        printf("Division error: %s\\n", strerror(errno));
    } else {
        printf("Result: %d\\n", result);
    }
    
    // Example 3: Error codes
    if (divide(10, 2, &result)) {
        printf("Division error\\n");
    } else {
        printf("Result: %d\\n", result);
    }
    
    return 0;
}`,
      notes: "C provides several mechanisms for error handling, but unlike languages with exceptions, C programmers must explicitly check for and handle errors.",
      questions: [
        {
          question: "What is the purpose of the errno variable?",
          options: [
            "To store the last error number",
            "To count errors in a program",
            "To define new error types",
            "To enable error exceptions"
          ],
          correctAnswer: "To store the last error number"
        },
        {
          question: "Which function converts an error number to a descriptive string?",
          options: ["perror", "strerror", "errno_to_string", "error_desc"],
          correctAnswer: "strerror"
        }
      ],
      detailedContent: {
        overview: "Effective error handling is essential for creating robust C programs that can gracefully handle unexpected conditions.",
        keyConcepts: [
          {
            title: "Error reporting mechanisms",
            link: "https://www.geeksforgeeks.org/error-handling-in-c/"
          },
          {
            title: "Standard error functions",
            link: "https://www.geeksforgeeks.org/c-standard-error-functions/"
          },
          {
            title: "Custom error handling",
            link: "https://www.geeksforgeeks.org/error-handling-and-exceptions-in-c/"
          },
          {
            title: "Error recovery strategies",
            link: "https://www.geeksforgeeks.org/handling-errors-in-c-programming/"
          },
          {
            title: "Defensive programming",
            link: "https://www.geeksforgeeks.org/defensive-programming-in-c/"
          }
        ],
        applications: [
          {
            title: "System programming",
            link: "https://www.geeksforgeeks.org/system-programming-in-c/"
          },
          {
            title: "Library development",
            link: "https://www.geeksforgeeks.org/creating-a-shared-library-in-c/"
          },
          {
            title: "Mission-critical software",
            link: "https://www.geeksforgeeks.org/what-is-mission-critical-software/"
          },
          {
            title: "User-facing applications",
            link: "https://www.geeksforgeeks.org/creating-gui-applications-with-c-and-gtk/"
          }
        ]        
      }
    },
    {
      title: "Bit Manipulation",
      duration: "2 weeks",
      content: "Bitwise operators (AND, OR, XOR, NOT, shifts), bit fields, practical applications of bit manipulation, and optimization techniques using bit operations.",
      difficulty: "Advanced",
      code: `#include <stdio.h>

// Bit manipulation functions
void print_binary(unsigned int num) {
    for (int i = sizeof(num) * 8 - 1; i >= 0; i--) {
        printf("%d", (num >> i) & 1);
        if (i % 4 == 0) printf(" ");
    }
    printf("\\n");
}

int main() {
    unsigned int flags = 0;
    
    // Setting bits
    #define FLAG_A (1 << 0) // 0001
    #define FLAG_B (1 << 1) // 0010
    #define FLAG_C (1 << 2) // 0100
    
    flags |= FLAG_A | FLAG_C;
    printf("Flags set: ");
    print_binary(flags);
    
    // Checking bits
    if (flags & FLAG_B) {
        printf("FLAG_B is set\\n");
    } else {
        printf("FLAG_B is not set\\n");
    }
    
    // Clearing bits
    flags &= ~FLAG_A;
    printf("Flags after clearing FLAG_A: ");
    print_binary(flags);
    
    // Toggling bits
    flags ^= FLAG_B;
    printf("Flags after toggling FLAG_B: ");
    print_binary(flags);
    
    // Bit fields
    struct {
        unsigned int is_set : 1;
        unsigned int count : 4;
    } status;
    
    status.is_set = 1;
    status.count = 7;
    
    return 0;
}`,
      notes: "Bit manipulation allows for compact data storage and efficient operations, particularly useful in low-level programming and performance-critical applications.",
      questions: [
        {
          question: "Which operator performs a bitwise AND?",
          options: ["&", "&&", "|", "||"],
          correctAnswer: "&"
        },
        {
          question: "What does the expression (x << 3) do?",
          options: [
            "Multiplies x by 8",
            "Divides x by 8",
            "Sets the left 3 bits of x",
            "Clears the right 3 bits of x"
          ],
          correctAnswer: "Multiplies x by 8"
        }
      ],
      detailedContent: {
        overview: "Bit manipulation provides direct control over individual bits in data, enabling space-efficient storage and optimized operations.",
        keyConcepts: [
          {
            title: "Bitwise operators",
            link: "https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/"
          },
          {
            title: "Bit masking",
            link: "https://www.geeksforgeeks.org/bit-masking-techniques-in-c/"
          },
          {
            title: "Bit fields",
            link: "https://www.geeksforgeeks.org/bit-fields-in-c/"
          },
          {
            title: "Bit manipulation algorithms",
            link: "https://www.geeksforgeeks.org/bit-manipulation-techniques/"
          },
          {
            title: "Practical applications",
            link: "https://www.geeksforgeeks.org/applications-of-bit-manipulation/"
          }
        ],
        applications: [
          {
            title: "Embedded systems",
            link: "https://www.geeksforgeeks.org/embedded-systems/"
          },
          {
            title: "Data compression",
            link: "https://www.geeksforgeeks.org/data-compression-techniques/"
          },
          {
            title: "Cryptography",
            link: "https://www.geeksforgeeks.org/cryptography-101-introduction/"
          },
          {
            title: "Graphics programming",
            link: "https://www.geeksforgeeks.org/graphics-programming-in-c/"
          }
        ]        
      }
    },
    {
      title: "Advanced I/O Operations",
      duration: "3 weeks",
      content: "Formatted I/O (printf, scanf variants), stream buffering, file descriptors, low-level I/O operations, and advanced file handling techniques in C.",
      difficulty: "Advanced",
      code: `#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>

int main() {
    // Formatted I/O
    printf("Formatted output: %-10s %04d %.2f\\n", "test", 42, 3.14159);
    
    // File operations
    FILE *file = fopen("example.txt", "w+");
    if (file) {
        fprintf(file, "This is a file write test\\n");
        fseek(file, 0, SEEK_SET);
        
        char buffer[100];
        while (fgets(buffer, sizeof(buffer), file)) {
            printf("Read from file: %s", buffer);
        }
        fclose(file);
    }
    
    // Low-level I/O
    int fd = open("example.bin", O_WRONLY | O_CREAT, 0644);
    if (fd != -1) {
        write(fd, "Binary data", 11);
        close(fd);
    }
    
    // Buffering control
    setvbuf(stdout, NULL, _IONBF, 0); // Unbuffered
    printf("This appears immediately");
    setvbuf(stdout, NULL, _IOLBF, 1024); // Line buffered
    
    return 0;
}`,
      notes: "C provides multiple levels of I/O operations, from high-level formatted I/O to low-level unbuffered operations, each with specific use cases and performance characteristics.",
      questions: [
        {
          question: "Which function provides unbuffered I/O?",
          options: ["fprintf", "write", "printf", "fputs"],
          correctAnswer: "write"
        },
        {
          question: "What does the 'b' flag in fopen indicate?",
          options: [
            "Binary mode",
            "Buffered mode",
            "Backup file",
            "Blocking mode"
          ],
          correctAnswer: "Binary mode"
        }
      ],
      detailedContent: {
        overview: "C's I/O system provides flexible options for handling input and output operations at different levels of abstraction.",
        keyConcepts: [
          {
            title: "Stream vs descriptor I/O",
            link: "https://www.geeksforgeeks.org/difference-between-stream-and-file-descriptor/"
          },
          {
            title: "Buffering strategies",
            link: "https://www.geeksforgeeks.org/buffered-io-in-c/"
          },
          {
            title: "Formatted I/O",
            link: "https://www.geeksforgeeks.org/formatted-input-and-output-in-c/"
          },
          {
            title: "File positioning",
            link: "https://www.geeksforgeeks.org/file-positioning-functions-in-c/"
          },
          {
            title: "Error handling",
            link: "https://www.geeksforgeeks.org/error-handling-in-c/"
          }
        ],
        applications: [
          {
            title: "File processing",
            link: "https://www.geeksforgeeks.org/file-handling-c/"
          },
          {
            title: "Device I/O",
            link: "https://www.geeksforgeeks.org/device-io-and-its-types-in-c/"
          },
          {
            title: "Network programming",
            link: "https://www.geeksforgeeks.org/socket-programming-in-c/"
          },
          {
            title: "Performance-critical I/O",
            link: "https://www.geeksforgeeks.org/optimizing-file-input-output-in-c/"
          }
        ]        
      }
    }
  ]);

  const handleTopicSelect = useCallback((topic) => {
    if (!topic) {
      console.error("No topic provided");
      return;
    }
    
    const topicTitle = topic.title || "Unknown Topic";
    console.log(`Selected topic: ${topicTitle}`);
    
    setLoadingContent(true);
    setSelectedTopic(topic);
    setActiveSection("content");
    setShowQuiz(false);
    setQuizSubmitted(false);
    setUserAnswers({});
  
    const topicRelatedContent = getRelatedContent(topicTitle);
    setRelatedContent(topicRelatedContent);
    setLoadingContent(false);
  }, []);

  const handleTakeQuiz = useCallback(() => {
    if (!selectedTopic) return;
    
    setLoadingQuiz(true);
    setTimeout(() => {
      const questions = (selectedTopic.questions && selectedTopic.questions.length > 0) 
        ? selectedTopic.questions 
        : [
            {
              question: `Sample question about ${selectedTopic.title || "this topic"}`,
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: "Option 1"
            }
          ];
      setQuizQuestions(questions);
      setShowQuiz(true);
      setLoadingQuiz(false);
    }, 500);
  }, [selectedTopic]);

  const handleAnswerSelect = useCallback((questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  }, []);

  const handleSubmitQuiz = useCallback(() => {
    const unanswered = quizQuestions.filter((_, i) => userAnswers[i] === undefined);
    if (unanswered.length > 0) {
      alert(`Please answer all questions (${unanswered.length} remaining)`);
      return;
    }

    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });

    setQuizResults({
      score: correct,
      total: quizQuestions.length,
      percentage: Math.round((correct / quizQuestions.length) * 100)
    });

    setQuizSubmitted(true);
    setQuizHistory(prev => [
      ...prev,
      {
        topic: selectedTopic?.title || "Unknown Topic",
        score: correct,
        total: quizQuestions.length,
        date: new Date().toLocaleDateString()
      }
    ]);
  }, [quizQuestions, userAnswers, selectedTopic]);

  const handleRunCode = useCallback(async () => {
    if (!selectedTopic?.code) {
      setCodeOutput("Error: No code to execute");
      return;
    }

    setRunningCode(true);
    setCodeOutput("Compiling and running code...");
    setWasmModule(null);

    try {
      const response = await fetch("/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedTopic.code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setCodeOutput(`Compilation failed: ${errorData.error || response.statusText}`);
        setRunningCode(false);
        return;
      }

      const data = await response.json();

      if (data.error) {
        setCodeOutput(`Compilation Error: ${data.error}\n${data.details || ""}`);
        setRunningCode(false);
        return;
      }

      if (!data.wasm) {
        setCodeOutput("Error: No wasm module received from compiler.");
        setRunningCode(false);
        return;
      }

      const wasmBuffer = Uint8Array.from(atob(data.wasm), c => c.charCodeAt(0));
      const instantiatedModule = await instantiateWasm(wasmBuffer);
      setWasmModule(instantiatedModule);

      if (typeof instantiatedModule.instance.exports._main === 'function') {
        const result = instantiatedModule.instance.exports._main();
        setCodeOutput(`Program exited with code: ${result}`);
      } else {
        setCodeOutput("Wasm module instantiated but _main export is not a callable function.");
      }
    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
    } finally {
      setRunningCode(false);
    }
  }, [selectedTopic]);

  const renderContentSection = () => {
    if (!selectedTopic) return null;

    return (
      <div className="content-section">
        <h2 className="text-2xl font-bold mb-4">{selectedTopic.title}</h2>
        <div className="meta-info mb-4">
          <span className="duration">Duration: {selectedTopic.duration}</span>
          <span className="difficulty ml-4">Difficulty: {selectedTopic.difficulty}</span>
        </div>
        
        <div className="content-card mb-6">
          <h3 className="text-xl font-semibold mb-2">Overview</h3>
          <p>{selectedTopic.content}</p>
        </div>

        {selectedTopic.detailedContent && (
          <div className="detailed-content mb-6">
            <h3 className="text-xl font-semibold mb-2">Detailed Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Key Concepts</h4>
                <ul className="list-disc pl-5">
                  {selectedTopic.detailedContent.keyConcepts.map((concept, i) => {
                    const conceptKey = typeof concept === 'object' 
                      ? concept.id || concept.title || concept.concept || `concept-${i}`
                      : `concept-${concept}`;
                    return (
                      <li key={conceptKey}>
                        {typeof concept === 'object' ? (
                          concept.link ? (
                            <a href={concept.link} target="_blank" rel="noopener noreferrer">
                              {concept.title || concept.concept || "Concept"}
                            </a>
                          ) : (
                            concept.title || concept.concept || "Concept"
                          )
                        ) : (
                          concept
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Applications</h4>
                <ul className="list-disc pl-5">
                  {selectedTopic.detailedContent.applications.map((app, i) => {
                    const appKey = typeof app === 'object' 
                      ? app.id || app.title || app.application || `app-${i}`
                      : `app-${app}`;
                    return (
                      <li key={appKey}>
                        {typeof app === 'object' ? (
                          app.link ? (
                            <a href={app.link} target="_blank" rel="noopener noreferrer">
                              {app.title || app.application || "Application"}
                            </a>
                          ) : (
                            app.title || app.application || "Application"
                          )
                        ) : (
                          app
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {selectedTopic.code && (
          <div className="code-section mb-6">
            <h3 className="text-xl font-semibold mb-2">Example Code</h3>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
              <code>{selectedTopic.code}</code>
            </pre>
            <button 
              onClick={handleRunCode}
              disabled={runningCode}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {runningCode ? "Running..." : "Run Code"}
            </button>
            {codeOutput && (
              <div className="output mt-2 bg-gray-100 p-4 rounded">
                <h4 className="font-medium">Output:</h4>
                <pre>{codeOutput}</pre>
              </div>
            )}
          </div>
        )}

        {relatedContent.length > 0 && (
          <div className="related-content mb-6">
            <h3 className="text-xl font-semibold mb-2">Related Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedContent.map((item) => {
                const itemKey = item.id || `${item.title}-${item.type}`;
                return (
                  <div key={itemKey} className="border p-4 rounded hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium">{item.title}</h4>
                    <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Resource →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="actions flex gap-4">
          <button 
            onClick={handleTakeQuiz}
            disabled={loadingQuiz}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
          >
            {loadingQuiz ? "Loading..." : "Take Quiz"}
          </button>
        </div>

        {quizHistory.length > 0 && (
          <div className="quiz-history mt-6">
            <h3 className="text-xl font-semibold mb-2">Your Quiz History</h3>
            <div className="space-y-2">
              {quizHistory.map((quiz) => {
                const quizKey = quiz.id || `${quiz.topic}-${quiz.date}`;
                return (
                  <div key={quizKey} className="border p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{quiz.topic}</span>
                      <span>{quiz.date}</span>
                    </div>
                    <div className="mt-1">
                      Score: {quiz.score}/{quiz.total} ({Math.round((quiz.score/quiz.total)*100)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuizSection = () => {
    if (!showQuiz) return null;

    return (
      <div className="quiz-section">
        <h2 className="text-2xl font-bold mb-4">{selectedTopic.title} Quiz</h2>
        
        {!quizSubmitted ? (
          <div className="questions">
            {quizQuestions.map((q) => {
              const questionKey = q.id || q.question.substring(0, 20);
              return (
                <div key={questionKey} className="question-card mb-4 p-4 border rounded">
                  <h3 className="text-lg font-medium mb-2">{q.question}</h3>
                  <div className="options">
                    {q.options.map((opt) => {
                      const optionKey = q.id ? `${q.id}-${opt}` : `${q.question.substring(0, 10)}-${opt}`;
                      return (
                        <div key={optionKey} className="option">
                          <input
                            type="radio"
                            id={optionKey}
                            name={`question-${questionKey}`}
                            checked={userAnswers[questionKey] === opt}
                            onChange={() => handleAnswerSelect(questionKey, opt)}
                          />
                          <label htmlFor={optionKey} className="ml-2">{opt}</label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <button
              onClick={handleSubmitQuiz}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="results">
            <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
            <p>You scored {quizResults.score} out of {quizResults.total} ({quizResults.percentage}%)</p>
            <button
              onClick={() => {
                setShowQuiz(false);
                setActiveSection("content");
              }}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Content
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Comprehensive C Programming Roadmap</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="topics-sidebar md:w-1/4">
            <h2 className="text-xl font-semibold mb-4">Topics</h2>
            <ul className="space-y-2">
              {topics.map((topic) => {
                const topicKey = topic.id || `${topic.title}-${topic.duration}`;
                return (
                  <li key={topicKey}>
                    <button
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left p-2 rounded ${
                        selectedTopic?.title === topic.title ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                    >
                      {topic.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="main-content md:w-3/4">
            {activeSection === "roadmap" && (
              <div className="roadmap-overview">
                <h2 className="text-2xl font-semibold mb-4">Roadmap Overview</h2>
                <p>Select a topic from the sidebar to begin learning about C programming concepts.</p>
              </div>
            )}

            {activeSection === "content" && renderContentSection()}
            {showQuiz && renderQuizSection()}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MainComponent;