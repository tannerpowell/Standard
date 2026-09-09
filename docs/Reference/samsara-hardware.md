# Custom Telematics Hardware: Replacing Samsara

## Business Case

Samsara cost: ~$150K/year (per Meghan, unconfirmed). Hardware is cheap, subscription is the pain.

At 354 vehicles, that's ~$425/vehicle/year or ~$35/vehicle/month.

Custom hardware alternative:
- **Upfront**: ~$50-80/unit x 354 = ~$18-28K
- **Ongoing**: ~$3-5/mo data per unit = ~$13-21K/year
- **Year one**: ~$31-49K total
- **Year two+**: ~$13-21K/year

**Potential savings: $100-130K/year after year one.**

---

## What a Samsara Gateway (VG54) Does

Four components:
1. **CAN bus reader** — OBD-II (pickups) or J1939 9-pin (Class 8). Reads engine data off the vehicle diagnostic bus.
2. **GPS module** — GNSS receiver for location, speed, heading.
3. **Cellular modem** — 4G LTE, pushes data to cloud.
4. **MCU** — Coordinates everything, buffers offline, manages power.

The AG51 (equipment tracker) is simpler: GPS + cellular + battery. No engine connection.

---

## Custom Hardware BOM (per unit, small scale)

| Component | Cost | Notes |
|-----------|------|-------|
| ESP32-S3 or STM32 MCU | $5-8 | Main processor |
| SIM7600 cellular modem | $15-25 | 4G LTE |
| u-blox NEO-M8N GPS | $10-15 | Location |
| MCP2515 CAN controller + transceiver | $3-5 | OBD-II / J1939 |
| SIM card + data plan | $3-5/mo | Hologram.io, 1NCE, etc. |
| Power regulator, enclosure, harness | $10-15 | Must be ruggedized |
| PCB fab | $5-10 | At 500 qty from JLCPCB |
| **Total** | **~$50-80 + $3-5/mo** | |

---

## Phased Rollout Strategy

### Phase 1: Asset Trackers (lowest risk)
Replace the 22 AG51 equipment trackers. GPS + cellular only, no CAN bus. Could prototype on a Particle Boron ($30) in a weekend. These are the weakest Samsara devices (GPS + battery only, no engine data) and still cost monthly.

### Phase 2: Pickup Fleet (OBD-II)
OBD-II is well-standardized. Ram 1500/2500, F-150/F-250, Silverado. Standard PIDs for odometer, RPM, coolant, fuel level, fault codes. ~249 TK-prefix vehicles, though many are pickups with simple OBD-II.

### Phase 3: Class 8 Fleet (J1939)
International, Peterbilt, Freightliner, Kenworth belly dumps and dump trucks. J1939 has thousands of SPNs with manufacturer-specific implementations. Harder to get right. Also: 107 trucks are tagged DOT-ELD, which requires FMCSA-certified hardware. These may need to stay on Samsara or a certified ELD provider.

### Leave on Samsara: Dashcams
335 vehicles have Samsara cameras. Video capture, compression, edge storage, selective upload, AI event detection (hard brake, collision, driver distraction), night vision. This is a computer vision product, not a telematics accessory. Don't try to replace this.

---

## Technical Challenges

### CAN Bus Compatibility
OBD-II standardized PIDs work for basics (RPM, speed, coolant temp). J1939 has manufacturer-specific SPNs. Samsara has years of compatibility testing across makes/models/years. Expect edge cases: a 2017 International reporting odometer on a non-standard PID, etc.

### Permian Basin Reliability
120°F cab temps, constant vibration, dust. Consumer dev boards die in months. Need: conformal coating, automotive-grade components, proper enclosures, wide-temp-range operation.

### Cellular Fleet Management
354 SIM cards. Dead zones. Offline buffering. OTA firmware updates. Device health monitoring. This is a fleet management problem on top of the fleet management problem.

### ELD Compliance (Class 8 only)
FMCSA regulations on electronic logging devices. Custom hardware needs certification. The 107 DOT-ELD tagged trucks can't just swap to uncertified hardware.

---

## What Custom Hardware Unlocks

- **Sampling rate control.** Samsara: odometer every ~30s. Custom: every 5s, or on-demand.
- **No per-vehicle subscription.** Just cellular data at $3-5/unit/mo.
- **Custom sensors.** Temperature probes, door sensors, PTO detection, fuel flow meters. No Samsara surcharge for auxiliary inputs.
- **Fuel-at-fill-up automation.** NFC tap at the pump auto-logs odometer from our device. No manual entry.
- **White-label.** Not reselling Samsara. Own platform for Rival, future clients.
- **Own the API.** The data format, endpoints, and retention policy are ours.

---

## Validation Prototype

Cost: ~$100. Time: a weekend.

1. Buy 3x Particle Boron ($30 each) or ESP32 + SIM7600 combos
2. Wire MCP2515 CAN bus shield to one, plug into truck OBD-II port
3. Read standard PIDs, push to our API endpoint (Next.js route on standardtx.com)
4. Compare data to Samsara's readings for the same truck
5. If they match, concept validated

---

## Open Questions

- **Confirm Samsara annual cost.** Meghan mentioned ~$150K/year. Need exact contract terms, per-unit pricing, and contract end date.
- **Camera contract separate?** If cameras are bundled with gateway pricing, replacing gateways might not reduce cost unless cameras are unbundled.
- **ELD provider alternative?** If we replace Samsara gateways, the 107 DOT-ELD trucks need a certified ELD solution. KeepTruckin, Motive, etc. Could be cheaper than Samsara for just ELD.
- **Samsara contract lock-in?** Multi-year commitment? Early termination fees?
