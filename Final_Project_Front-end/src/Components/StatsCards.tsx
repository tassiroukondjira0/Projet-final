type StatsCards = {
    title : string;
    value : string;
    color : string;
    percent : string;
    icon : string;
}

export default function StatsCards(props :StatsCards) {
    return (
        <div className={`${props.color} w-full rounded-2xl p-5 shadow-sm sm:p-6`} >
            <span className="inline-flex ">{props.title}</span>
            <div className="mt-2 flex items-center justify-between gap-4">
               <h3 className=" font-bold text-xl">{props.value}</h3>
               <div className="flex items-center gap-2 ">
                   <span className="text-sm ">{props.percent}</span>
                   <img src={props.icon} className="w-4 h-4" alt="fleche" />
               </div>
           </div>

            </div>
    );
}
