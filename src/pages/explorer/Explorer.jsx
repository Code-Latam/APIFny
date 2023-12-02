
import ProductTree from "../../components/producttree/ProductTree";
import "./explorer.css" ;

export default function Explorer({designerMode}) {
  console.log("DESIGNERMODE");
  console.log(designerMode);
  return (
    <>
      <div className="WorkflowtreePanel">
        <ProductTree 
        designerMode={designerMode}
        />
      </div>
      
    </>

  );
}
