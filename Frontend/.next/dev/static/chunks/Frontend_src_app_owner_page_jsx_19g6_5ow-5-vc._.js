(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Frontend/src/app/owner/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
    const [startTime, setStartTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [endTime, setEndTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [slots, setSlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [lotStats, setLotStats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // Stores occupancy & surge info
    const [selectedSlot, setSelectedSlot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingSlots, setLoadingSlots] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [bookingLoading, setBookingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmedBooking, setConfirmedBooking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [errorMsg, setErrorMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
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
    const handleSearchSlots = async (e)=>{
        if (e) e.preventDefault();
        setErrorMsg('');
        setConfirmedBooking(null);
        setSelectedSlot(null);
        setLoadingSlots(true);
        try {
            const res = await fetch(`${API_BASE}/slots/available?locationId=${DEFAULT_LOCATION_ID}&startTime=${new Date(startTime).toISOString()}&endTime=${new Date(endTime).toISOString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to search slots');
            // data now contains { slots, dynamicHourlyRate, surgeMultiplier, occupancyPercentage }
            setSlots(data.slots || []);
            setLotStats({
                occupancyPercentage: data.occupancyPercentage,
                dynamicHourlyRate: data.dynamicHourlyRate,
                surgeMultiplier: data.surgeMultiplier,
                isSurgeActive: parseFloat(data.surgeMultiplier) > 1.0
            });
            if (!data.slots || data.slots.length === 0) {
                setErrorMsg('All parking slots are fully occupied for this time window.');
            }
        } catch (err) {
            setErrorMsg(err.message);
        } finally{
            setLoadingSlots(false);
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
                    userId: DEMO_USER_ID,
                    slotId: selectedSlot.id,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString()
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Reservation failed');
            setConfirmedBooking(data);
            setSelectedSlot(null);
            handleSearchSlots();
        } catch (err) {
            setErrorMsg(err.message);
        } finally{
            setBookingLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: '#fff',
            padding: '30px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: '900px',
                margin: '0 auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    style: {
                        color: '#38bdf8',
                        marginBottom: '8px'
                    },
                    children: "ParkEase — MatchDay Booking Engine"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 98,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: '#94a3b8',
                        marginBottom: '24px'
                    },
                    children: "Real-time concurrency locks & surge pricing"
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 99,
                    columnNumber: 17
                }, this),
                lotStats?.isSurgeActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        backgroundColor: '#7c2d12',
                        border: '1px solid #ea580c',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: [
                                "🔥 ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "High Demand / Surge Active:"
                                }, void 0, false, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 104,
                                    columnNumber: 34
                                }, this),
                                " MatchDay traffic has pushed lot occupancy to ",
                                lotStats.occupancyPercentage,
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 104,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                backgroundColor: '#ea580c',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: 'bold'
                            },
                            children: [
                                lotStats.surgeMultiplier,
                                " Surge"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 105,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 103,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: '12px',
                        background: '#1e293b',
                        padding: '16px',
                        borderRadius: '10px',
                        marginBottom: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "datetime-local",
                            value: startTime,
                            onChange: (e)=>setStartTime(e.target.value),
                            style: {
                                padding: '8px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#fff',
                                borderRadius: '6px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 111,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "datetime-local",
                            value: endTime,
                            onChange: (e)=>setEndTime(e.target.value),
                            style: {
                                padding: '8px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                color: '#fff',
                                borderRadius: '6px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 117,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSearchSlots,
                            disabled: loadingSlots,
                            style: {
                                padding: '8px 20px',
                                background: '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            },
                            children: loadingSlots ? 'Scanning...' : 'Search Inventory'
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 123,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 110,
                    columnNumber: 17
                }, this),
                errorMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        color: '#f87171',
                        marginBottom: '16px'
                    },
                    children: errorMsg
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 132,
                    columnNumber: 30
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '14px',
                        marginBottom: '24px'
                    },
                    children: slots.map((slot)=>{
                        const isSelected = selectedSlot?.id === slot.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            onClick: ()=>setSelectedSlot(slot),
                            style: {
                                padding: '16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                                backgroundColor: isSelected ? '#1e3a8a' : '#1e293b',
                                textAlign: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold'
                                    },
                                    children: slot.slot_number
                                }, void 0, false, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 151,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: '#4ade80',
                                        fontSize: '0.8rem',
                                        marginTop: '4px'
                                    },
                                    children: "Available"
                                }, void 0, false, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 152,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        color: slot.is_surge_active ? '#fb923c' : '#94a3b8',
                                        fontSize: '0.85rem',
                                        marginTop: '6px',
                                        fontWeight: '600'
                                    },
                                    children: [
                                        "$",
                                        slot.effective_hourly_rate,
                                        "/hr"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 153,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, slot.id, true, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 139,
                            columnNumber: 29
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 135,
                    columnNumber: 17
                }, this),
                selectedSlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#1e293b',
                        padding: '16px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Locking Spot: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: selectedSlot.slot_number
                                        }, void 0, false, {
                                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                            lineNumber: 165,
                                            columnNumber: 49
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 165,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        marginLeft: '16px',
                                        color: '#38bdf8'
                                    },
                                    children: [
                                        "Rate: $",
                                        selectedSlot.effective_hourly_rate,
                                        "/hr"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                                    lineNumber: 166,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 164,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirmBooking,
                            disabled: bookingLoading,
                            style: {
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            },
                            children: bookingLoading ? 'Securing Lock...' : 'Confirm & Generate Ticket'
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 168,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 163,
                    columnNumber: 21
                }, this),
                confirmedBooking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#1e293b',
                        border: '1px solid #059669',
                        padding: '24px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                color: '#34d399',
                                margin: '0 0 12px 0'
                            },
                            children: "Ticket Confirmed & Slot Locked!"
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 181,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: confirmedBooking.qrCode,
                            alt: "Entry Pass",
                            style: {
                                width: '180px',
                                height: '180px',
                                borderRadius: '8px',
                                background: '#fff',
                                padding: '8px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 182,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                color: '#94a3b8',
                                fontSize: '0.9rem',
                                marginTop: '12px'
                            },
                            children: [
                                "Total Amount: $",
                                confirmedBooking.pricingDetails.totalAmount,
                                " (",
                                confirmedBooking.pricingDetails.durationHours,
                                " hrs)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Frontend/src/app/owner/page.jsx",
                            lineNumber: 183,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Frontend/src/app/owner/page.jsx",
                    lineNumber: 180,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Frontend/src/app/owner/page.jsx",
            lineNumber: 97,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Frontend/src/app/owner/page.jsx",
        lineNumber: 96,
        columnNumber: 9
    }, this);
}
_s(BookingPage, "FjrOG89SjTfooq7VkqsqJXzjlq4=");
_c = BookingPage;
var _c;
__turbopack_context__.k.register(_c, "BookingPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Frontend_src_app_owner_page_jsx_19g6_5ow-5-vc._.js.map