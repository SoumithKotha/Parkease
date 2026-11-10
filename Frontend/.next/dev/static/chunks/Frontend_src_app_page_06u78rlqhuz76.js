(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Frontend/src/app/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BookingPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function BookingPage() {
    _s();
    const API_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const DEFAULT_LOCATION_ID = '11111111-1111-1111-1111-111111111111';
    // Persistent anonymous client token for FIFO Redis queue positioning
    const [clientId, setClientId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingPage.useEffect": ()=>{
            let id = localStorage.getItem('parkease_client_id');
            if (!id) {
                id = 'usr_' + Math.random().toString(36).substring(2, 10);
                localStorage.setItem('parkease_client_id', id);
            }
            setClientId(id);
        }
    }["BookingPage.useEffect"], []);
    // Form & Filter States
    const [startTime, setStartTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [endTime, setEndTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedFilter, setSelectedFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [slots, setSlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedSlot, setSelectedSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingSlots, setLoadingSlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bookingLoading, setBookingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmedBooking, setConfirmedBooking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [errorMsg, setErrorMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Waiting Room State
    const [queueState, setQueueState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        inQueue: false,
        position: 0,
        estimatedWaitSeconds: 0
    });
    const queueIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Lot Metrics & Surge State
    const [lotMetrics, setLotMetrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        locationName: 'Central Campus Lot A',
        totalSlots: 10,
        occupiedSlots: 0,
        occupancyPercentage: '0%',
        occupancyRatioNum: 0,
        baseRate: 15,
        dynamicHourlyRate: 15,
        surgeMultiplier: '1.00x',
        isSurgeActive: false,
        source: 'initial'
    });
    // Set default start/end dates
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingPage.useEffect": ()=>{
            const now = new Date();
            const start = new Date(now.getTime() + 60 * 60 * 1000);
            const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            const pad = {
                "BookingPage.useEffect.pad": (n)=>String(n).padStart(2, '0')
            }["BookingPage.useEffect.pad"];
            const format = {
                "BookingPage.useEffect.format": (d)=>`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
            }["BookingPage.useEffect.format"];
            setStartTime(format(start));
            setEndTime(format(end));
        }
    }["BookingPage.useEffect"], []);
    // Poll waiting room queue position if client is queued
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookingPage.useEffect": ()=>{
            if (queueState.inQueue && clientId) {
                queueIntervalRef.current = setInterval({
                    "BookingPage.useEffect": async ()=>{
                        try {
                            const res = await fetch(`${API_BASE}/queue/status?userId=${clientId}&locationId=${DEFAULT_LOCATION_ID}`);
                            const data = await res.json();
                            if (!data.inQueue) {
                                clearInterval(queueIntervalRef.current);
                                setQueueState({
                                    inQueue: false,
                                    position: 0,
                                    estimatedWaitSeconds: 0
                                });
                                // Queue cleared: automatically execute search
                                executeSearch();
                            } else {
                                setQueueState({
                                    inQueue: true,
                                    position: data.position,
                                    estimatedWaitSeconds: data.estimatedWaitSeconds
                                });
                            }
                        } catch (e) {
                            // If queue check errors out, admit user
                            clearInterval(queueIntervalRef.current);
                            setQueueState({
                                inQueue: false,
                                position: 0,
                                estimatedWaitSeconds: 0
                            });
                        }
                    }
                }["BookingPage.useEffect"], 3000);
            }
            return ({
                "BookingPage.useEffect": ()=>clearInterval(queueIntervalRef.current)
            })["BookingPage.useEffect"];
        }
    }["BookingPage.useEffect"], [
        queueState.inQueue,
        clientId
    ]);
    // Trigger search with queue check
    const handleSearchSlots = async (e)=>{
        if (e) e.preventDefault();
        setErrorMsg('');
        setConfirmedBooking(null);
        setSelectedSlot(null);
        if (!startTime || !endTime) {
            setErrorMsg('Please select both start and end times.');
            return;
        }
        // Step 1: Check-in with Virtual Waiting Room
        try {
            const qRes = await fetch(`${API_BASE}/queue/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: clientId,
                    locationId: DEFAULT_LOCATION_ID
                })
            });
            const qData = await qRes.json();
            if (qData.inQueue) {
                setQueueState({
                    inQueue: true,
                    position: qData.position,
                    estimatedWaitSeconds: qData.estimatedWaitSeconds
                });
                return; // Halt search until user exits queue
            }
        } catch (e) {
        // Continue search on queue-check network error
        }
        executeSearch();
    };
    const executeSearch = async (overrideFilter = selectedFilter)=>{
        setLoadingSlots(true);
        try {
            const filterParam = overrideFilter !== 'all' ? `&slotType=${overrideFilter}` : '';
            const res = await fetch(`${API_BASE}/slots/available?locationId=${DEFAULT_LOCATION_ID}&startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}${filterParam}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to scan inventory');
            const slotsList = data.slots || [];
            const total = data.totalSlots || 10;
            const occupied = data.occupiedSlots !== undefined ? data.occupiedSlots : total - slotsList.length;
            const ratio = total > 0 ? occupied / total : 0;
            const surgeMultiplierNum = parseFloat(data.surgeMultiplier) || 1.0;
            setSlots(slotsList);
            setLotMetrics({
                locationName: 'Central Campus Lot A',
                totalSlots: total,
                occupiedSlots: occupied,
                occupancyPercentage: data.occupancyPercentage || `${Math.round(ratio * 100)}%`,
                occupancyRatioNum: ratio,
                baseRate: data.baseRate || 15,
                dynamicHourlyRate: data.dynamicHourlyRate || 15,
                surgeMultiplier: data.surgeMultiplier || '1.00x',
                isSurgeActive: surgeMultiplierNum > 1.0,
                source: data.source || 'database'
            });
            if (slotsList.length === 0) {
                setErrorMsg(`No active slots found for vehicle type "${overrideFilter.toUpperCase()}".`);
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally{
            setLoadingSlots(false);
        }
    };
    const handleFilterClick = (filterType)=>{
        setSelectedFilter(filterType);
        setSelectedSlot(null);
        if (startTime && endTime) {
            executeSearch(filterType);
        }
    };
    const handleConfirmBooking = async ()=>{
        if (!selectedSlot) return;
        setErrorMsg('');
        setBookingLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: clientId,
                    slotId: selectedSlot.id,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString()
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reservation failed');
            setConfirmedBooking(data);
            setSelectedSlot(null);
            executeSearch();
        } catch (err) {
            setErrorMsg(err.message);
        } finally{
            setBookingLoading(false);
        }
    };
    const getSlotTypeBadge = (type)=>{
        switch(type){
            case 'ev':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: styles.evBadge,
                    children: "⚡ EV Fast"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/page.js",
                    lineNumber: 215,
                    columnNumber: 16
                }, this);
            case 'suv':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: styles.suvBadge,
                    children: "🚙 Large SUV"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/page.js",
                    lineNumber: 217,
                    columnNumber: 16
                }, this);
            case 'accessible':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: styles.accessibleBadge,
                    children: "♿ Accessible"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/page.js",
                    lineNumber: 219,
                    columnNumber: 16
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: styles.compactBadge,
                    children: "🚗 Compact"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/page.js",
                    lineNumber: 221,
                    columnNumber: 16
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                style: styles.navBar,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.brandGroup,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.brandIcon,
                                children: "🚗"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 230,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.brandName,
                                children: "ParkEase"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 231,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.navLinks,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/",
                                style: {
                                    ...styles.navLink,
                                    ...styles.navLinkActive
                                },
                                children: "Reserve"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/owner",
                                style: styles.navLink,
                                children: "Owner Portal"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/verify",
                                style: styles.navLink,
                                children: "Verify QR"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 236,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Frontend/src/app/page.js",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: styles.main,
                children: [
                    queueState.inQueue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.queueBanner,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.queueHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.queuePulseIndicator
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            fontSize: '1.05rem',
                                            color: '#fbbf24'
                                        },
                                        children: "MatchDay Flash Rush Detected! Traffic Surge in Progress"
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.queueText,
                                children: [
                                    "To ensure fair allocation, you have entered our priority queue. You are currently",
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.queueRank,
                                        children: [
                                            "#",
                                            queueState.position
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 254,
                                        columnNumber: 15
                                    }, this),
                                    " in line."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 252,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.queueProgressDetails,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Estimated wait time: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    "~",
                                                    queueState.estimatedWaitSeconds,
                                                    " seconds"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 257,
                                                columnNumber: 42
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '0.8rem',
                                            color: '#94a3b8'
                                        },
                                        children: "Powered by Redis FIFO Sorted Sets"
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 256,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 245,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            ...styles.heroBanner,
                            background: lotMetrics.isSurgeActive ? 'linear-gradient(135deg, #431407 0%, #7c2d12 40%, #1e1b4b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                            border: lotMetrics.isSurgeActive ? '1px solid #ea580c' : '1px solid #6366f1'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.heroTopRow,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.heroCategoryBadge,
                                                children: lotMetrics.isSurgeActive ? '⚡ FLASH SURGE ACTIVE' : 'SMART PARKING MANAGEMENT'
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 275,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                style: styles.heroTitle,
                                                children: "Reserve Your Parking Slot"
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 278,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: styles.heroSubtitle,
                                                children: "Select your schedule to view live slot availability, dynamic pricing, and get an instant entry pass."
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 279,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 274,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.locationBadgeGroup,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.locationPill,
                                                children: [
                                                    "📍 ",
                                                    lotMetrics.locationName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 285,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.ratePill,
                                                children: [
                                                    "Base Rate: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            "$",
                                                            lotMetrics.dynamicHourlyRate,
                                                            "/hr"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Frontend/src/app/page.js",
                                                        lineNumber: 287,
                                                        columnNumber: 28
                                                    }, this),
                                                    lotMetrics.isSurgeActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: styles.baseCrossedOut,
                                                        children: [
                                                            "($",
                                                            lotMetrics.baseRate,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Frontend/src/app/page.js",
                                                        lineNumber: 288,
                                                        columnNumber: 46
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 273,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.meterContainer,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.meterHeader,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.meterStats,
                                                children: [
                                                    "Occupancy: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: [
                                                            lotMetrics.occupiedSlots,
                                                            " / ",
                                                            lotMetrics.totalSlots,
                                                            " Slots Taken"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Frontend/src/app/page.js",
                                                        lineNumber: 297,
                                                        columnNumber: 28
                                                    }, this),
                                                    " (",
                                                    lotMetrics.occupancyPercentage,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 296,
                                                columnNumber: 15
                                            }, this),
                                            lotMetrics.isSurgeActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.surgeTag,
                                                children: [
                                                    "🔥 ",
                                                    lotMetrics.surgeMultiplier,
                                                    " Surge Active"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 300,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.normalTag,
                                                children: "🟢 Standard Demand (1.00x)"
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 302,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 295,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.progressBarBg,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                ...styles.progressBarFill,
                                                width: lotMetrics.occupancyPercentage,
                                                backgroundColor: lotMetrics.occupancyRatioNum >= 0.75 ? '#ef4444' : lotMetrics.occupancyRatioNum >= 0.5 ? '#f59e0b' : '#10b981'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/page.js",
                                            lineNumber: 306,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 305,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.filterBar,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: styles.filterLabel,
                                children: "Vehicle Type:"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 326,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.filterPills,
                                children: [
                                    {
                                        id: 'all',
                                        label: 'All Spots'
                                    },
                                    {
                                        id: 'compact',
                                        label: '🚗 Compact / Sedan'
                                    },
                                    {
                                        id: 'suv',
                                        label: '🚙 SUV'
                                    },
                                    {
                                        id: 'ev',
                                        label: '⚡ EV Fast Charger'
                                    },
                                    {
                                        id: 'accessible',
                                        label: '♿ Accessible'
                                    }
                                ].map((f)=>{
                                    const isActive = selectedFilter === f.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleFilterClick(f.id),
                                        style: {
                                            ...styles.filterButton,
                                            backgroundColor: isActive ? '#38bdf8' : '#1e293b',
                                            color: isActive ? '#0f172a' : '#94a3b8',
                                            borderColor: isActive ? '#38bdf8' : '#334155',
                                            fontWeight: isActive ? '700' : '500'
                                        },
                                        children: f.label
                                    }, f.id, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 337,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 327,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 325,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: styles.searchCard,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSearchSlots,
                            style: styles.searchForm,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.inputBlock,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: styles.inputLabel,
                                            children: "START TIME"
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/page.js",
                                            lineNumber: 359,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "datetime-local",
                                            value: startTime,
                                            onChange: (e)=>setStartTime(e.target.value),
                                            style: styles.timeInput,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/page.js",
                                            lineNumber: 360,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Frontend/src/app/page.js",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: styles.inputBlock,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: styles.inputLabel,
                                            children: "END TIME"
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/page.js",
                                            lineNumber: 370,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "datetime-local",
                                            value: endTime,
                                            onChange: (e)=>setEndTime(e.target.value),
                                            style: styles.timeInput,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/page.js",
                                            lineNumber: 371,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Frontend/src/app/page.js",
                                    lineNumber: 369,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loadingSlots || queueState.inQueue,
                                    style: {
                                        ...styles.searchBtn,
                                        opacity: loadingSlots || queueState.inQueue ? 0.7 : 1
                                    },
                                    children: loadingSlots ? 'Scanning...' : '🔍 Find Available Slots'
                                }, void 0, false, {
                                    fileName: "[project]/Frontend/src/app/page.js",
                                    lineNumber: 380,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Frontend/src/app/page.js",
                            lineNumber: 357,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this),
                    errorMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.errorBanner,
                        children: errorMsg
                    }, void 0, false, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 390,
                        columnNumber: 22
                    }, this),
                    slots.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: styles.slotsSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.sectionHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: styles.sectionTitle,
                                        children: "Available Parking Bays"
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 396,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.cacheBadge,
                                        children: lotMetrics.source === 'redis_cache' ? '⚡ Served via Redis Cache' : '🗄️ Fresh DB Scan'
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 397,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 395,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.slotsGrid,
                                children: slots.map((slot)=>{
                                    const isSelected = selectedSlot?.id === slot.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>setSelectedSlot(slot),
                                        style: {
                                            ...styles.slotCard,
                                            border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                                            backgroundColor: isSelected ? '#1e3a8a' : '#1e293b'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.slotId,
                                                children: slot.slot_number
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 415,
                                                columnNumber: 21
                                            }, this),
                                            getSlotTypeBadge(slot.slot_type),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.slotRate,
                                                children: [
                                                    "$",
                                                    slot.effective_hourly_rate,
                                                    "/hr"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 417,
                                                columnNumber: 21
                                            }, this),
                                            slot.is_surge_active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: styles.slotSurgePill,
                                                children: slot.surge_multiplier
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 419,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, slot.id, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 406,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 402,
                                columnNumber: 13
                            }, this),
                            selectedSlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.checkoutBar,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.selectedSlotName,
                                                children: [
                                                    "Selected Bay: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: selectedSlot.slot_number
                                                    }, void 0, false, {
                                                        fileName: "[project]/Frontend/src/app/page.js",
                                                        lineNumber: 431,
                                                        columnNumber: 35
                                                    }, this),
                                                    " (",
                                                    selectedSlot.slot_type?.toUpperCase(),
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 430,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.selectedPriceInfo,
                                                children: [
                                                    "Rate: $",
                                                    selectedSlot.effective_hourly_rate,
                                                    "/hr",
                                                    selectedSlot.slot_type === 'ev' && ' (Includes +$5 EV Charging Utility)'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 433,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 429,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleConfirmBooking,
                                        disabled: bookingLoading,
                                        style: styles.confirmBtn,
                                        children: bookingLoading ? 'Acquiring Distributed Lock...' : 'Lock Slot & Issue Pass'
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 439,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 428,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 394,
                        columnNumber: 11
                    }, this),
                    confirmedBooking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: styles.confirmationCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.passHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.confirmedBadge,
                                        children: "PASS ACTIVE"
                                    }, void 0, false, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 455,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: styles.bookingRef,
                                        children: [
                                            "ID: ",
                                            confirmedBooking.booking.id.slice(0, 8),
                                            "..."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 456,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 454,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: styles.passTitle,
                                children: "Reservation Confirmed!"
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 459,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: styles.passSubtitle,
                                children: "Scan this pass at the gate boom barrier to enter."
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 460,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.qrBox,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: confirmedBooking.qrCode,
                                    alt: "Entry QR",
                                    style: styles.qrImg
                                }, void 0, false, {
                                    fileName: "[project]/Frontend/src/app/page.js",
                                    lineNumber: 463,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 462,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.passDetails,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Assigned Bay: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedSlot?.slot_number || 'Confirmed'
                                            }, void 0, false, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 471,
                                                columnNumber: 34
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 471,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Duration: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    confirmedBooking.pricingDetails?.durationHours,
                                                    " hrs"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 472,
                                                columnNumber: 30
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 472,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Total Billed: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    "$",
                                                    confirmedBooking.booking.total_amount
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Frontend/src/app/page.js",
                                                lineNumber: 473,
                                                columnNumber: 34
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Frontend/src/app/page.js",
                                        lineNumber: 473,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Frontend/src/app/page.js",
                                lineNumber: 470,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Frontend/src/app/page.js",
                        lineNumber: 453,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Frontend/src/app/page.js",
                lineNumber: 240,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Frontend/src/app/page.js",
        lineNumber: 226,
        columnNumber: 5
    }, this);
}
_s(BookingPage, "Y4uhTCqaQvkkB7/PxvjhCliIFhA=");
_c = BookingPage;
// Inline Styles
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        paddingBottom: '60px'
    },
    navBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 36px',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a'
    },
    brandGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    brandIcon: {
        fontSize: '1.5rem'
    },
    brandName: {
        fontSize: '1.35rem',
        fontWeight: '800',
        color: '#38bdf8',
        letterSpacing: '-0.02em'
    },
    navLinks: {
        display: 'flex',
        gap: '20px'
    },
    navLink: {
        color: '#94a3b8',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    navLinkActive: {
        color: '#38bdf8',
        fontWeight: '700'
    },
    main: {
        maxWidth: '1050px',
        margin: '32px auto 0 auto',
        padding: '0 20px'
    },
    queueBanner: {
        backgroundColor: '#1c1917',
        border: '1px solid #f59e0b',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px'
    },
    queueHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '6px'
    },
    queuePulseIndicator: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#f59e0b',
        boxShadow: '0 0 8px #f59e0b'
    },
    queueText: {
        margin: '0 0 10px 0',
        color: '#d6d3d1',
        fontSize: '0.95rem'
    },
    queueRank: {
        color: '#38bdf8',
        fontWeight: '800',
        fontSize: '1.1rem'
    },
    queueProgressDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#fbbf24',
        borderTop: '1px dashed #44403c',
        paddingTop: '8px'
    },
    heroBanner: {
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        marginBottom: '20px'
    },
    heroTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '20px'
    },
    heroCategoryBadge: {
        fontSize: '0.75rem',
        fontWeight: '800',
        letterSpacing: '0.08em',
        color: '#cbd5e1',
        marginBottom: '8px'
    },
    heroTitle: {
        fontSize: '2rem',
        fontWeight: '800',
        margin: '0 0 8px 0'
    },
    heroSubtitle: {
        color: '#e2e8f0',
        fontSize: '0.95rem',
        maxWidth: '560px',
        margin: 0,
        lineHeight: 1.5
    },
    locationBadgeGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
    },
    locationPill: {
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        padding: '8px 14px',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: '600',
        border: '1px solid rgba(255, 255, 255, 0.15)'
    },
    ratePill: {
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    baseCrossedOut: {
        textDecoration: 'line-through',
        color: '#94a3b8',
        marginLeft: '6px',
        fontSize: '0.8rem'
    },
    meterContainer: {
        marginTop: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    meterHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    meterStats: {
        fontSize: '0.88rem',
        color: '#f8fafc'
    },
    surgeTag: {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: '800'
    },
    normalTag: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: '#6ee7b7',
        border: '1px solid #059669',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: '700'
    },
    progressBarBg: {
        height: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '999px',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        transition: 'width 0.4s ease'
    },
    filterBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
    },
    filterLabel: {
        fontSize: '0.85rem',
        fontWeight: '700',
        color: '#94a3b8'
    },
    filterPills: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    filterButton: {
        border: '1px solid',
        borderRadius: '999px',
        padding: '6px 14px',
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    searchCard: {
        backgroundColor: '#1e293b',
        borderRadius: '14px',
        border: '1px solid #334155',
        padding: '20px 24px',
        marginBottom: '24px'
    },
    searchForm: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '16px',
        alignItems: 'end'
    },
    inputBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    inputLabel: {
        fontSize: '0.75rem',
        color: '#94a3b8',
        fontWeight: '700'
    },
    timeInput: {
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '0.9rem',
        outline: 'none'
    },
    searchBtn: {
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '11px 24px',
        fontWeight: '700',
        fontSize: '0.9rem',
        cursor: 'pointer',
        height: '42px'
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid #ef4444',
        color: '#fca5a5',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    slotsSection: {
        marginTop: '28px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: '700',
        margin: 0
    },
    cacheBadge: {
        fontSize: '0.75rem',
        color: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: '4px 8px',
        borderRadius: '6px',
        border: '1px solid rgba(56, 189, 248, 0.25)'
    },
    slotsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px'
    },
    slotCard: {
        borderRadius: '10px',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        position: 'relative'
    },
    slotId: {
        fontSize: '1.25rem',
        fontWeight: '800'
    },
    compactBadge: {
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
        color: '#cbd5e1',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '600'
    },
    suvBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: '#fcd34d',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '600'
    },
    evBadge: {
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        color: '#67e8f9',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '700'
    },
    accessibleBadge: {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        color: '#d8b4fe',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '600'
    },
    slotRate: {
        fontSize: '0.85rem',
        color: '#94a3b8',
        marginTop: '4px'
    },
    slotSurgePill: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        backgroundColor: '#ea580c',
        color: '#fff',
        fontSize: '0.65rem',
        fontWeight: '800',
        padding: '2px 5px',
        borderRadius: '4px'
    },
    checkoutBar: {
        marginTop: '20px',
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    selectedSlotName: {
        fontSize: '1rem',
        color: '#f8fafc'
    },
    selectedPriceInfo: {
        fontSize: '0.85rem',
        color: '#38bdf8',
        marginTop: '4px'
    },
    confirmBtn: {
        backgroundColor: '#10b981',
        color: '#ffffff',
        border: 'none',
        padding: '11px 22px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '0.9rem',
        cursor: 'pointer'
    },
    confirmationCard: {
        marginTop: '32px',
        backgroundColor: '#1e293b',
        border: '1px solid #10b981',
        borderRadius: '14px',
        padding: '28px',
        textAlign: 'center',
        maxWidth: '460px',
        margin: '32px auto 0 auto'
    },
    passHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    confirmedBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: '#34d399',
        fontSize: '0.75rem',
        fontWeight: '800',
        padding: '4px 10px',
        borderRadius: '999px',
        border: '1px solid #059669'
    },
    bookingRef: {
        color: '#64748b',
        fontSize: '0.8rem',
        fontFamily: 'monospace'
    },
    passTitle: {
        margin: '0 0 6px 0',
        fontSize: '1.35rem'
    },
    passSubtitle: {
        color: '#94a3b8',
        fontSize: '0.88rem',
        margin: '0 0 16px 0'
    },
    qrBox: {
        backgroundColor: '#ffffff',
        display: 'inline-block',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '16px'
    },
    qrImg: {
        width: '180px',
        height: '180px',
        display: 'block'
    },
    passDetails: {
        borderTop: '1px dashed #334155',
        paddingTop: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#cbd5e1'
    }
};
var _c;
__turbopack_context__.k.register(_c, "BookingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Frontend_src_app_page_06u78rlqhuz76.js.map