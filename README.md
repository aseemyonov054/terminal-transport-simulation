# Terminal Transport Simulation

A web-based discrete event simulation tool for analyzing truck traffic at container terminals. The model estimates how limited service resources (gates, checkpoints) affect truck handling time and queue lengths under realistic arrival conditions.

## Overview

The application lets you draw a truck route on a terminal layout map, place service points (gates, inspection stations) along the route, and run a simulation to observe how trucks move through the system. Results are visualized as a 3D animation and queue-length charts.

**Key capabilities:**
- Upload a terminal layout image as a background reference
- Draw truck paths using an interactive SVG canvas editor
- Place queueing service nodes at any point along the route
- Run a SimPy-based discrete event simulation with exponential inter-arrival and service times
- View animated 3D playback (Three.js) of truck movements
- Analyze per-gate queue length over time via Chart.js
- Export simulation results to an Excel spreadsheet (`variant.xlsx`)
- Define multiple parallel processes to model separate truck flows in one project

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Django 4.1 |
| Simulation engine | SimPy |
| 3D animation | Three.js (r161) |
| Frontend charts | Chart.js |
| Data export | openpyxl |
| Database | SQLite (default Django) |

## Project Structure

```
src/
├── idealthreejs/          # Django project settings and root URLs
│   ├── settings.py
│   └── urls.py            # mounts threejsapp under /dddmodel/
└── threejsapp/            # main application
    ├── models.py          # Project model (stores paths and 3D model config as JSON)
    ├── views.py           # request handlers for all simulation workflows
    ├── forms.py           # background image upload form
    ├── service_process_simulation.py  # SimPy DES engine
    ├── service_model_settings.py      # ProcessDescription, travel time calculation
    ├── service_path_creation.py       # geometry helpers (vector angles)
    ├── file_services.py               # DXF file reader for path import
    ├── templates/threejsapp/
    │   ├── canvas_path.html   # SVG path editor
    │   ├── index.html         # 3D animation + statistics view
    │   ├── forms.html         # image upload form
    │   ├── list_of_projects.html
    │   ├── path_list.html
    │   └── select_model.html  # 3D model picker (truck/ship)
    └── static/threejsapp/
        ├── model_description.js       # Three.js scene and animation
        ├── select_model.js
        └── three_d_models/            # GLTF assets (truck, container ship)
```

## Getting Started

### Prerequisites

```
Python 3.10+
pip
```

### Installation

```bash
cd src
pip install django simpy openpyxl pillow numpy openpyxl
python manage.py migrate
python manage.py runserver
```

The server starts at `http://127.0.0.1:8000`.

## Usage

### Single-process simulation

1. Go to `http://127.0.0.1:8000/dddmodel/draw/`
2. Upload a terminal layout image (PNG/JPG) as background
3. Use the canvas editor to draw the truck route:
   - **Add line** — click to place waypoints connected by road segments
   - **Add Queueing System** — click to place a service gate on the route
   - **Pointer binding** — snaps to nearby existing points
   - Scroll to zoom, right-click drag to pan
4. Click **Submit** to run the simulation and open the animation view

### Multi-process (parallel flows) simulation

1. Go to `http://127.0.0.1:8000/dddmodel/parallel/`
2. Create a new project and upload a terminal image
3. Add multiple paths — each path corresponds to an independent truck flow
4. Assign a 3D vehicle model to each path
5. Click **Run simulation** to execute the combined model

### Path input via DXF

On the canvas editor, use the file input to upload a `.dxf` file instead of drawing manually.

## Simulation Model

The simulation uses **SimPy** (a process-based discrete event simulation library).

- **Arrivals**: trucks arrive according to an exponential distribution. The default inter-arrival interval is derived from an annual cargo flow of 400 000 TEU (utilization factor 0.7, TEU/truck ratio 1.6), giving roughly 760 trucks per day spread uniformly over 24 hours.
- **Travel**: travel time between waypoints is computed from Euclidean distance at a fixed speed (333 units/minute).
- **Service**: each gate is a `simpy.Resource` with configurable capacity (parallel channels) and exponentially distributed service time.
- **Statistics collected per truck**: arrival time, departure time, service time at each gate, waiting time at each gate, queue length snapshot.
- **Output**: results are written to `variant.xlsx` with one row per truck.

## URL Reference

All routes are mounted under `/dddmodel/`:

| URL | Method | Description |
|---|---|---|
| `/dddmodel/` | GET | Redirect to canvas path editor |
| `/dddmodel/draw/` | GET/POST | Upload background image; draw and submit a single path |
| `/dddmodel/animate/` | GET/POST | Run static demo or process submitted path data |
| `/dddmodel/parallel/` | GET | List of saved multi-process projects |
| `/dddmodel/parallel/new/` | GET/POST | Create a new project |
| `/dddmodel/parallel/new_path/` | POST | Start adding a path to a project |
| `/dddmodel/parallel/create_path/` | POST | Open canvas editor for a specific path |
| `/dddmodel/parallel/save_path/` | POST | Save a drawn path to the project |
| `/dddmodel/parallel/run_sim/` | POST | Run the full multi-process simulation |

## Available 3D Models

| File | Description |
|---|---|
| `Truck2.gltf` | Truck (primary vehicle) |
| `truck.gltf` | Alternative truck model |
| `ContainerShip5.gltf` | Container ship |
| `sphere1.gltf` | Generic sphere placeholder |
