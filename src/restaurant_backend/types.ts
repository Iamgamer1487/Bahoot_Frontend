//import anything from @/libs/firebase
import { db } from "@/libs/firebase"

const items = [
    {
    id: 1,
    name: "raw_chicken",
    date: "",
    supply_from_food: "",
    supply_from_machine: "fridge",
    used_on: ["grill", "frier"]
    },
    {
    id: 2,
    name: "grilled_chicken",
    date: "",
    supply_from_food: "raw_chicken", //Raw chicken family
    supply_from_machine: "grill", //Put raw chicken IN the grill
    used_on: ["counter"]
    },
    {
    id: 3,
    name: "frier_chicken",
    date: "",
    supply_from_food: "raw_chicken", //Raw chicken family
    supply_from_machine: "frier", //Put raw chicken IN the Frier
    used_on: ["counter"]
    },
    {
    id: 4,
    name: "raw_meat",
    date: "",
    supply_from_food: "",
    supply_from_machine: "fridge",
    used_on: ["grill"]
    },


]
