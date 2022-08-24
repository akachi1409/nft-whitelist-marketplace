import "./CreatePageComp.css";
import { Container, Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
// import https from 'https';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate} from 'react-router-dom';

function CreatePageComp() {
  const [files, setFiles] = useState(new FormData());
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(0);
  const [flag, setFlag] = useState(true);
  const [etherPrice, setEtherPrice] = useState(0);
  const [clankPrice, setClankPrice] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [endTime, setEndTime] = useState(new Date())

  const blockchain = useSelector((state) => state.blockchain);
  let navigate = useNavigate();
  const notify = (msg) => toast(msg);

  const onNav = (url) =>{
    navigate(url)
  }
  useEffect(() => {
    if (blockchain.account === null) {
      navigate("/");
    }
    setFirstLoad(false);
    /* eslint-disable */
  }, [firstLoad])

  const handleFile = (e) => {
    if (e.target.files.length === 0) return;
    var file = e.target.files[0];
    var reader = new FileReader();
    /* eslint-disable */
    var url = reader.readAsDataURL(file);
    /* eslint-disable */
    reader.onloadend = function () {
      setImage(reader.result);
      setFlag(!flag);
    };
    var filesTemp = files;
    filesTemp.append(e.target.files[0].name, e.target.files[0]);
    setFiles(filesTemp);
    setFileName(e.target.files[0].name);
  };

  const onSubmit = async () => {
    console.log('---')
    if (name ===""){
      notify("You should input the name of project.")
      return;
    }
    if (image ===null){
      notify("You should input the image for the project.")
      return;
    }
    if (limit ===0){
      notify("You should input the whitelist limit amount.")
      return;
    }
    if (etherPrice ===0){
      notify("You should input the price of Ether to submit the WL request.")
      return;
    }
    if (clankPrice ===0){
      notify("You should input the price of Clank to submit the WL request.")
      return;
    }
    if (fileName ===""){
      notify("You should upload the image of project");
      return;
  }
    try {
      var filesTemp = files;
      filesTemp.append("fileName", fileName);
      filesTemp.append("name", name);
      filesTemp.append("limit", limit);
      filesTemp.append("etherPrice", etherPrice);
      filesTemp.append("clankPrice", clankPrice);
      filesTemp.append("endTime",  moment(endTime).format('YYYY-MM-DD HH:MM:SS'))
      // filesTemp.append("endTime",  endTime)
      filesTemp.append("description", description);
      // console.log("files:", moment(endTime).format('YYYY-MM-DD HH:MM:SS'));
      // filesTemp.append("", );
      // const instance = axios.create({
      //   httpsAgent: new https.Agent({  
      //     rejectUnauthorized: false
      //   })
      // });
      const res = await axios.post(`api/project/insert`, filesTemp)
      console.log("res", res);
      if (res.status === 200 && res.data.success===true){
        navigate("/")
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <div className="createPageComp-layout">
      <Container>
        <Row>
          <h2 className="createPageComp-title">Create Project</h2>
        </Row>
        <Row>
          <div className="createPageComp-title-layout">
            <h2 className="preview-title">Preview Project Image.</h2>
            
            {image !== null && (
              <img
                src={image}
                alt="Preview Image"
                className="createPageComp-image"
              />
            )}
          </div>
          <Col lg="8">
            <h2 className="createPageComp-title">Upload file (*)</h2>
            <div className="createPageComp-file-layout">
              <input
                className="createPageComp-file-input"
                type="file"
                onChange={(e) => handleFile(e)}
              />
              <div className="createPageComp-file-div">
                <div className="createPageComp-svg-div">
                  <svg
                    width="97"
                    height="97"
                    viewBox="0 0 97 97"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ margin: "auto" }}
                  >
                    <g clipPath="url(#clip0_59_1363)">
                      <path
                        d="M74.8615 37.2817C74.5992 37.2817 74.3366 37.2866 74.0739 37.2958C72.7858 24.3211 61.8082 14.1548 48.5002 14.1548C35.1923 14.1548 24.2143 24.3212 22.9264 37.2959C22.6634 37.2864 22.4007 37.2818 22.1383 37.2818C9.93125 37.2817 0 47.2132 0 59.4202C0 71.6276 9.93125 81.5587 22.1385 81.5587C23.5597 81.5587 24.7115 80.4067 24.7115 78.9857C24.7115 77.5647 23.5596 76.4126 22.1385 76.4126C12.7693 76.4126 5.14623 68.79 5.14623 59.4203C5.14623 50.0507 12.7693 42.4281 22.1385 42.4281C23.0762 42.4281 24.0235 42.5065 24.955 42.6614C25.7071 42.7864 26.4761 42.5714 27.0543 42.0743C27.6323 41.5773 27.9604 40.8493 27.9498 40.0868L27.9484 39.9939C27.9476 39.9476 27.9466 39.9013 27.9466 39.8547C27.9466 28.5216 37.1668 19.301 48.5005 19.301C59.8339 19.301 69.0542 28.5216 69.0542 39.8547C69.0542 39.8985 69.0534 39.942 69.0527 39.9855L69.0513 40.0925C69.0421 40.854 69.3712 41.5804 69.9494 42.076C70.5277 42.5715 71.2948 42.786 72.0471 42.6607C72.9755 42.5062 73.9224 42.4276 74.8618 42.4276C84.2315 42.4276 91.8541 50.0503 91.8541 59.4199C91.8541 68.7894 84.2315 76.4121 74.8618 76.4121C73.4409 76.4121 72.2888 77.5643 72.2888 78.9852C72.2888 80.4064 73.4409 81.5582 74.8618 81.5582C87.0692 81.5582 97.0003 71.6271 97.0003 59.4197C97 47.2132 87.0689 37.2817 74.8615 37.2817Z"
                        fill="#3E5B51"
                      />
                      <path
                        d="M36.2126 38.9409C36.2126 32.8405 41.1755 27.8775 47.276 27.8775C48.6973 27.8775 49.8491 26.7256 49.8491 25.3045C49.8491 23.8836 48.6971 22.7314 47.276 22.7314C38.3379 22.7314 31.0664 30.003 31.0664 38.9411C31.0664 40.3623 32.2184 41.5141 33.6394 41.5141C35.0605 41.5141 36.2126 40.3621 36.2126 38.9409Z"
                        fill="#3E5B51"
                      />
                      <path
                        d="M70.6161 67.6182L50.0209 52.5279C49.1156 51.8644 47.8845 51.8644 46.9793 52.5279L26.29 67.6871C25.3923 68.3447 25.0188 69.5051 25.3651 70.5627C25.7113 71.6205 26.6979 72.3358 27.8109 72.3358H35.2542V80.2726C35.2542 81.6938 36.4063 82.8456 37.8273 82.8456H59.173C60.5942 82.8456 61.746 81.6936 61.746 80.2726V72.3358H69.1898C69.1911 72.3358 69.1927 72.3358 69.1941 72.3358C70.615 72.3358 71.7671 71.1839 71.7671 69.7628C71.7668 68.8675 71.3099 68.0789 70.6161 67.6182ZM59.1728 67.1896C57.7519 67.1896 56.5998 68.3417 56.5998 69.7626V77.6994H40.4001V69.7626C40.4001 68.3417 39.2482 67.1896 37.8271 67.1896H35.676L48.5003 57.7934L61.3244 67.1896H59.1728Z"
                        fill="#3E5B51"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_59_1363">
                        <rect width="97" height="97" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <h4 className="createPageComp-svg-title">
                    Drag&Drop file you want to upload
                  </h4>
                  <h5 className="createPageComp-svg-text">
                    Click on the button or Drag&Drop files here
                  </h5>
                </div>

                <button className="createPageComp-file-btn" type="button">
                  <div>Browse Files</div>
                </button>
              </div>
            </div>
            <h2 className="createPageComp-title">Project Name (*)</h2>
            <Row>
              <input
                placeholder="Project Name"
                className="createPageComp-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Row>
            <h2 className="createPageComp-title">Total Whitelist Spots (*)</h2>
            <Row>
              <input
                placeholder="WL Address Limit"
                className="createPageComp-input"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </Row>
            <h2 className="createPageComp-title">Ether Price (*)</h2>
            <Row>
              <input
                placeholder="Ether Price"
                className="createPageComp-input"
                value={etherPrice}
                onChange={(e) => setEtherPrice(e.target.value)}
              />
            </Row>
            <h2 className="createPageComp-title">Clank Price (*)</h2>
            <Row>
              <input
                placeholder="Clank Price"
                className="createPageComp-input"
                value={clankPrice}
                onChange={(e) => setClankPrice(e.target.value)}
              />
            </Row>
            <h2 className="createPageComp-title">Project Description (*)</h2>
            <Row>
              <input
                placeholder="Description"
                className="createPageComp-input"
                value={description}
                
                onChange={(e) => setDescription(e.target.value)}
              />
            </Row>
            <h2 className="createPageComp-title">Project End Date</h2>
            <Row>
              <DatePicker 
              className="createPageComp-input" 
              selected={endTime} 
              minDate = {new Date()}
              onChange={(date) => setEndTime(date)} />
            </Row>
            <Row>
              <button
                className="createPageComp-submit"
                onClick={() => onSubmit()}
              >
                Create Project
              </button>
              <button
                className="createPageComp-submit"
                onClick={() => onNav("/")}
              >
                Back Home
              </button>
              {/* <Button2 title="Login"></Button2> */}
            </Row>
          </Col>
        </Row>

        <br />
        <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      </Container>
    </div>
  );
}
export default CreatePageComp;
