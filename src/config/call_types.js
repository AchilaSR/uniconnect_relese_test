const getCallType = () => {
    return {
        showExtensions: false,
        showPhone: false,
        showQueues: false,
        showIvrExtension: false
    }
}

export default [
    {
        ...getCallType(),
        label: "Inbound Calls",
        filter: [{ source: 1, destination: 0 }],
        showExtensions: true,
        showPhone: true,
    },
    {
        ...getCallType(),
        label: "Outbound Calls",
        filter: [
            { source: 0, destination: 1 },
            { source: 0, destination: 13 },
            { source: 0, destination: 12 },
        ],
        showExtensions: true,
        showPhone: true,
    },
    {
        ...getCallType(),
        label: "Internal Calls",
        filter: [{ source: 0, destination: 0 }],
        showExtensions: true,
    },
    {
        ...getCallType(),
        label: "IVR Calls",
        filter: [{ source: 1, destination: 14 }],
        showIvrExtension: true
    },
    {
        ...getCallType(),
        label: "Conference Calls",
        filter: [
            { source: 9 },
            { destination: 9 },
        ],
        showExtensions: true,
        showPhone: true,
    },
    {
        ...getCallType(),
        label: "Voice Mail",
        filter: [
            { source: 5 },
            { destination: 5 },
        ],
        showExtensions: true,
    },
    {
        ...getCallType(),
        label: "Queues",
        filter: [{ source: 1, destination: 4 }],
        showQueues: true,
        showPhone: true
    }
];