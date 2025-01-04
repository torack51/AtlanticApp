interface Geometry {
    type: 'Polygon';
    coordinates: number[][][];
}

interface Properties {
    id: string;
    title: string;
    height: number;
    defaultZoom: number;
    color: string;
    centerCoordinates: [number, number];
}

interface Feature {
    type: 'Feature';
    geometry: Geometry;
    properties: Properties;
}

const data: Feature[] = [
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.574553, 48.359811],
                    [-4.574350, 48.359878],
                    [-4.574281, 48.359948],
                    [-4.574182, 48.360011],
                    [-4.574018, 48.360083],
                    [-4.573809, 48.360132],
                    [-4.573604, 48.360129],
                    [-4.573410, 48.360078],
                    [-4.573266, 48.360003],
                    [-4.572688, 48.359241],
                    [-4.572654, 48.359137],
                    [-4.572711, 48.358955],
                    [-4.572869, 48.358819],
                    [-4.573167, 48.358706],
                    [-4.573355, 48.358690],
                    [-4.573479, 48.358695],
                    [-4.573699, 48.358632],
                    [-4.574553, 48.359811],
                ],
            ],
        },
        properties: {
            id: 'piste_athletisme',
            title: "Piste d'athlétisme",
            height: 5,
            defaultZoom: 16,
            color: 'rgb(200,85,10)',
            centerCoordinates: [-4.573555, 48.359468],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.574255, 48.359719],
                    [-4.573478, 48.359956],
                    [-4.572812, 48.359138],
                    [-4.573549, 48.358864],
                    [-4.574255, 48.359719],
                ],
            ],
        },
        properties: {
            id: 'terrain_synthetique',
            title: 'Terrain multisports rénové',
            height: 15,
            defaultZoom: 17,
            color: 'rgb(100,200,50)',
            centerCoordinates: [-4.573555, 48.359468],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572417, 48.357310],
                    [-4.571604, 48.357529],
                    [-4.571064, 48.356643],
                    [-4.571894, 48.356426],
                    [-4.572417, 48.357310],
                ],
            ],
        },
        properties: {
            id: 'terrain_herbe',
            title: 'Champ de patates',
            height: 5,
            defaultZoom: 16,
            color: 'rgb(100,200,50)',
            centerCoordinates: [-4.571753, 48.357017],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572410, 48.360197],
                    [-4.571261, 48.360119],
                    [-4.571287, 48.359998],
                    [-4.571357, 48.360008],
                    [-4.571379, 48.359885],
                    [-4.572165, 48.359941],
                    [-4.572134, 48.360151],
                    [-4.572411, 48.360171],
                    [-4.572410, 48.360197],
                ],
            ],
        },
        properties: {
            id: 'rak',
            title: 'Restaurant Associatif de Kernévent',
            height: 5,
            defaultZoom: 16,
            color: 'rgb(0,0,0)',
            centerCoordinates: [-4.571718, 48.360051],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.573503, 48.358449],
                    [-4.573256, 48.358085],
                    [-4.573200, 48.358102],
                    [-4.573138, 48.358026],
                    [-4.572799, 48.358128],
                    [-4.572987923456566, 48.35841371118798],
                    [-4.573103, 48.358574],
                    [-4.573503, 48.358449],
                ],
            ],
        },
        properties: {
            id: 'gymnase_grande_salle',
            title: 'Gymnase : grande salle',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(50,50,150)',
            centerCoordinates: [-4.573172, 48.358337],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572875, 48.358569],
                    [-4.572623, 48.358626],
                    [-4.572484, 48.358421],
                    [-4.572756155857917, 48.358350032297665],
                    [-4.572818, 48.358456],
                    [-4.572875, 48.358569],
                ],
            ],
        },
        properties: {
            id: 'gymnase_petite_salle',
            title: 'Gymnase : petite salle',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(150,50,50)',
            centerCoordinates: [-4.572737, 48.358493],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572906, 48.358628],
                    [-4.572633, 48.358715],
                    [-4.572613, 48.358665],
                    [-4.572623, 48.358626],
                    [-4.572875, 48.358569],
                    [-4.572906, 48.358628],
                ],
            ],
        },
        properties: {
            id: 'mur_escalade',
            title: "Mur d'escalade",
            height: 20,
            defaultZoom: 18,
            color: 'rgb(0,50,50)',
            centerCoordinates: [-4.572759, 48.358638],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.569618793432085, 48.35803347458949],
                    [-4.5693162637251135, 48.35811745396822],
                    [-4.5691698228467885, 48.35796346768598],
                    [-4.569336752146853, 48.35791368174685],
                    [-4.569502119335539, 48.357864698500435],
                    [-4.569618793432085, 48.35803347458949],
                ],
            ],
        },
        properties: {
            id: 'foyer',
            title: 'Foyer',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(54, 30, 158)',
            centerCoordinates: [-4.569362778974892, 48.358017022228836],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572987923456566, 48.35841371118798],
                    [-4.572818, 48.358456],
                    [-4.572756155857917, 48.358350032297665],
                    [-4.572717, 48.358291],
                    [-4.572774097658396, 48.35824222277955],
                    [-4.572858474453227, 48.35821393023838],
                    [-4.572987923456566, 48.35841371118798],
                ],
            ],
        },
        properties: {
            id: 'accueil_buvette',
            title: 'ACCUEIL - Buvette',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(255,255,0)',
            centerCoordinates: [-4.57284138582483, 48.358349341629264],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572774097658396, 48.35824222277955],
                    [-4.572673583189669, 48.35809813435645],
                    [-4.572585456312282, 48.35812393513194],
                    [-4.572717, 48.358291],
                    [-4.572774097658396, 48.35824222277955],
                ],
            ],
        },
        properties: {
            id: 'vestiaires',
            title: 'Vestiaires',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(66,245,99)',
            centerCoordinates: [-4.572689542849616, 48.35819494250353],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.570426710327922, 48.35835239464299],
                    [-4.570295657871355, 48.358383213262044],
                    [-4.570240648142033, 48.35832426373199],
                    [-4.5703506675550045, 48.35830213527785],
                    [-4.570426710327922, 48.35835239464299],
                ],
            ],
        },
        properties: {
            id: 'dps',
            title: 'Sécurité - DPS',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(245,66,66)',
            centerCoordinates: [-4.570326398598439, 48.35834603388585],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.570849401984987, 48.358451794747424],
                    [-4.570645542531452, 48.35851352134256],
                    [-4.570632599062151, 48.358495048163235],
                    [-4.570478895511343, 48.35853892866902],
                    [-4.570362404376681, 48.35837082439784],
                    [-4.570543612767267, 48.358324399441074],
                    [-4.570742618430501, 48.358299475791625],
                    [-4.570849401984987, 48.358451794747424],
                ],
            ],
        },
        properties: {
            id: 'salle_b03',
            title: 'Salle B03 - Dépôt des affaires',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(255,255,0)',
            centerCoordinates: [-4.570601939226975, 48.35842033115671],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.570237583541484, 48.35832023732604],
                    [-4.56988630295686, 48.358426843914856],
                    [-4.569858130071282, 48.3583883704259],
                    [-4.569795621481347, 48.35840839693546],
                    [-4.569675882459563, 48.358236131286986],
                    [-4.5700953992061955, 48.35810732509697],
                    [-4.570237583541484, 48.35832023732604],
                ],
            ],
        },
        properties: {
            id: 'meridienne',
            title: 'Méridienne',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(54,30,158)',
            centerCoordinates: [-4.569970289232771, 48.358279566698286],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.57534438101456, 48.36037222634235],
                    [-4.5747562721306565, 48.360475728248474],
                    [-4.574044906934233, 48.360539451632064],
                    [-4.573569489580763, 48.3605282981047],
                    [-4.573590619231084, 48.36041184881148],
                    [-4.574580854113037, 48.360401560931905],
                    [-4.5752767193415025, 48.360284594495454],
                    [-4.57534438101456, 48.36037222634235],
                ],
            ],
        },
        properties: {
            id: 'gymnase_kroas_saliou',
            title: 'Gymnase de Kroas Saliou',
            height: 5,
            defaultZoom: 16,
            color: 'rgb(54,30,158)',
            centerCoordinates: [-4.574628743089022, 48.360441914474734],
        },
    },
    {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [-4.572717, 48.358291],
                    [-4.572423, 48.358388],
                    [-4.572452, 48.358432],
                    [-4.572756155857917, 48.358350032297665],
                    [-4.572717, 48.358291],
                ],
            ],
        },
        properties: {
            id: 'village_sponsor',
            title: 'Village sponsor',
            height: 5,
            defaultZoom: 18,
            color: 'rgb(54,30,158)',
            centerCoordinates: [-4.5725686342673555, 48.35836981979105],
        },
    },
];

export default data;