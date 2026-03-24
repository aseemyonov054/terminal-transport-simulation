from django.shortcuts import render
from django.http import HttpResponse
import json
from .forms import BackgroundInputForm
from idealthreejs.settings import STATIC_ROOT
import os
from PIL import Image
from .file_services import read_file
from .service_process_simulation import run_simulation
from .service_model_settings import calculate_travel_time, reform_path, ProcessDescription
from .models import Project

def index(request):
    '''
        Returns page with interface to input path
    '''
    action = "/dddmodel/animate/"
    return render(request, "threejsapp/canvas_path.html", {"action" : action})

def animate(request):
    if request.method == "GET":
        '''
            Returns page with static animation
        '''
        # draw_road - defines, if the roads will be drawn in the model
        draw_road_1 = True
        # points
        road_path_1 = [
            ['move', [0,500]],
            ['move', [0,0]],
            ['move', [250,0]],
            ['serve', [250,0]],
            ['move', [300,0]],
            ['move', [300, -250]],
            ['serve', [300,-250]],
            ['move', [300,-500]]
        ]
        # queue_points == services at [0,0] with x channels that work for y minutes [[0,0], x, y]
        queue_points_1 = [
            [[250-25, -25], 1, 20],
            [[300-25, -250-25], 1, 25],
        ]
        # calculate travel time
        travel_time_1, list_of_roads_1, road_path_1 = calculate_travel_time(road_path_1)
        first_process = ProcessDescription(draw_road_1,road_path_1,queue_points_1, travel_time_1, list_of_roads_1)
        
        # second process
        draw_road_2 = True
        # points
        road_path_2 = [
            ['move', [-250,500]],
            ['move', [-250,0]],
            ['serve', [-250,0]],
            ['move', [-250,-500]],
        ]
        # queue_points == services at [0,0] with x channels that work for y minutes [[0,0], x, y]
        queue_points_2 = [
            [[-250-25, 0-25], 1, 20],
        ]
        # calculate travel time
        travel_time_2, list_of_roads_2, road_path_2 = calculate_travel_time(road_path_2)
        second_process = ProcessDescription(draw_road_2,road_path_2,queue_points_2, travel_time_2, list_of_roads_2)

        list_of_processes = [first_process, second_process]

        # generate random events
        list_of_processes = run_simulation(2, list_of_processes)
        
        new_list_of_processes = [first_process.print_object(), second_process.print_object()]
        
        return render(request, "threejsapp/index.html", {"list_of_processes" : new_list_of_processes})
    else:
        image_path = request.FILES['image_path']
        print(image_path)
        img = Image.open(image_path)
        img_width, img_height = img.size
        if "draw_road" in request.POST:
            draw_road = True
        else:
            draw_road = False
        list_of_actions = json.loads(request.POST['list_of_actions'])
        road_path, queue_points = reform_path(list_of_actions)
        # calculate travel time
        travel_time, list_of_roads, road_path = calculate_travel_time(road_path)
        second_process = ProcessDescription(draw_road, road_path, queue_points, travel_time, list_of_roads)

        list_of_processes = [second_process]
        # generate random events
        list_of_events = run_simulation(100, list_of_processes)
        new_list_of_processes = [second_process.print_object()]
        return render(request, "threejsapp/index.html", {"list_of_processes" : new_list_of_processes,
                                                         "image_path" : image_path,
                                                         "img_height" : img_height,
                                                         "img_width" : img_width})
    
def draw(request):
    '''
        Returns page with interface to input path
    '''
    if request.method == "POST":
        image = request.FILES['image']
        with open(os.getcwd() + "/media/threejsapp/back_imgs/file.png", "wb") as f:
            f.write(image.read())
        image_path = "/media/threejsapp/back_imgs/file.png"
        img = Image.open(os.getcwd() + image_path)
        img_width, img_height = img.size
        # next action
        action = "/dddmodel/animate/"
        return render(request, "threejsapp/canvas_path.html", {"image_path" : image_path,
                                                               "img_width" : img_width,
                                                               "img_height" : img_height,
                                                               "img_x" : int(img_width / 2) * (-1) + 400,
                                                               "img_y" : int(img_height / 2) * (-1) + 300,
                                                               "action" : action})
    else:
        phrase = "Add image"
        action = "/dddmodel/draw/"
        form = BackgroundInputForm()
        return render(request, "threejsapp/forms.html", {"form" : form,
                                                         "phrase" : phrase,
                                                         "action" : action})

def parallel(request):
    '''
        This function will return paths to the creation of parallel processes
    '''
    list_of_projects = Project.objects.all()
    return render(request, "threejsapp/list_of_projects.html", {"list_of_project" : list_of_projects})

def new_model(request):
    if request.method == "POST":
        # create model name
        model_name = "model_" + str(Project.objects.count())

        # get img
        image = request.FILES['image']
        with open(os.getcwd() + "/media/threejsapp/back_imgs/" + model_name + ".png", "wb") as f:
            f.write(image.read())
        image_path = "/media/threejsapp/back_imgs/" + model_name + ".png"

        # add data to db
        project = Project.objects.create(
            model_name=model_name,
            img_path=image_path,
            three_d_models=[],
            path=[]
        )
        return render(request, "threejsapp/path_list.html", {"model_id" : project.id})
    else:
        phrase = "Add image"
        action = "/dddmodel/parallel/new/"
        form = BackgroundInputForm()
        return render(request, "threejsapp/forms.html", {"form" : form,
                                                         "phrase" : phrase,
                                                         "action" : action})

def new_path(request):
    if request.method == "POST":
        model_id = request.POST['model_id']
        return render(request, "threejsapp/select_model.html", {"model_id" : model_id})

def create_path(request):
    if request.method == "POST":
        # get data
        model_id = request.POST['model_id']
        model_name = request.POST["list_of_models"]

        #return canvas
        project = Project.objects.get(id=model_id)
        image_path = project.img_path
        img = Image.open(os.getcwd() + project.img_path)
        img_scale = 1
        img_width, img_height = img.size

        # update path
        old_path = project.three_d_models
        list_of_paths = project.path
        list_of_lines = []
        # increment coordinates to represent model cerrectly
        for path in list_of_paths:
            old_x = None
            old_y = None
            new_x = None
            new_y = None
            var_path = []
            for p in path:
                p['x'] += 400
                p['y'] = -1 * p['y'] + 300
                if old_x == None and old_y == None:
                    old_x = p['x']
                    old_y = p['y']
                else:
                    new_x = p['x']
                    new_y = p['y']
                    var_path.append({"x1" : old_x, "x2" : new_x, "y1" : old_y, "y2" : new_y})
                    old_x = p['x']
                    old_y = p['y']
            list_of_lines.append(var_path)
        print(list_of_lines)
        old_path.append(model_name)

        # update data
        project.three_d_models = old_path
        project.save()

        # next url
        action = "/dddmodel/parallel/save_path/"
        return render(request, "threejsapp/canvas_path.html", {"image_path" : image_path,
                                                               "img_width" : img_width * img_scale,
                                                               "img_height" : img_height * img_scale,
                                                               "img_x" : -1 * img_width / 2 + 400,
                                                               "img_y" : -1 * img_height / 2 + 300,
                                                               "action" : action,
                                                               "model_id" : model_id,
                                                               "list_of_paths" : list_of_paths,
                                                               "list_of_lines" : list_of_lines})

def save_path(request):
    if request.method == "POST":
        model_id = request.POST['model_id']
        if len(list(request.FILES.keys())) == 0:
            list_of_actions = json.loads(request.POST['list_of_actions'])
            print(list_of_actions)
            graph_connections = json.loads(request.POST['graph_conn'])
            print(graph_connections)
        else:
            file = request.FILES['drawing']
            list_of_actions = read_file(file)
            graph_connections = []
        # get from db
        project = Project.objects.get(id=model_id)
        # update data
        old_path = project.path
        old_path.append(list_of_actions)
        project.path = old_path
        project.save()
        # return to list of paths
        return render(request, "threejsapp/path_list.html", {"model_id" : model_id,
                                                             "list_of_paths" : old_path})

def run_sim(request):
    if request.method == "POST":
        model_id = request.POST['model_id']
        # get from db
        project = Project.objects.get(id=model_id)
        # get path data
        path = project.path
        # get model data
        list_of_models = project.three_d_models
        print(list_of_models)
        # get image data
        image_path = project.img_path
        img = Image.open(os.getcwd() + project.img_path)
        img_scale = 1
        img_width, img_height = img.size
        # run simulation
        draw_road = True
        list_of_processes = []
        for p in path:
            var_p = str(p).replace("None", "'None'")
            var_p = var_p.replace("'", '"')
            list_of_actions = json.loads(var_p)
            road_path, queue_points = reform_path(list_of_actions)
            # calculate travel time
            travel_time, list_of_roads, road_path = calculate_travel_time(road_path)
            second_process = ProcessDescription(draw_road, road_path, queue_points, travel_time, list_of_roads)
            list_of_processes.append(second_process) 
        # run simulation model
        cargoflow = 400000 * 0.7 / 1.6
        num_of_cars = int(cargoflow/365)
        filename = "variant.xlsx"
        run_simulation(num_of_cars, list_of_processes, filename)
        new_list_of_processes = []
        for process in list_of_processes:
            new_list_of_processes.append(process.print_object())

        show_animation = True
        if show_animation:
            return render(request, "threejsapp/index.html", {"list_of_processes" : new_list_of_processes,
                                                            "list_of_models" : list_of_models,
                                                            "image_path" : image_path,
                                                            "img_height" : img_height * img_scale,
                                                            "img_width" : img_width * img_scale})
        else:
            return HttpResponse("Ok")



        