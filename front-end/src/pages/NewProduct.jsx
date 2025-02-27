import { Box, Typography, TextField, Button, Card, CardContent, Container } from '@mui/material';
import { CloudUpload } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import http from "../http";
import * as yup from 'yup';
import dayjs from 'dayjs';
import axios from 'axios';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';

function NewProduct() {
    // // Image Upload to S3 from Form
    const [img, setImg] = useState();
    const [imgURL, setImgURL] = useState();
    const [err, setError] = useState("");
    const validTypes = ['image/jpg', 'image/png', 'image/jpeg']
    const handleImgChange = (e) => {
        if (validTypes.find(type => type === e.target.files[0].type)) {
            setError();
            setImg(e.target.files[0]);
            setImgURL(URL.createObjectURL(e.target.files[0]));
        }
        else {
            setImg();
            setImgURL();
            setError("Please only upload PNG/JPG/JPEG images.");
        }
    }

    const handleImgUpload = async (imgBlob, dbID) => {
        const photoKey = dbID
        // Trigger Lambda to get s3 presigned url      
        try {
            const data = {
                "ContentType": imgBlob.type
            };
            const response = await http.post(`/uploadImage/${photoKey}`, data).then((res) => {
                return res.data;
            })
            const url = response;
            console.log(url);
            const result = await axios.put(url, imgBlob, {
                headers: {
                    "Content-Type": imgBlob.type
                },
            });
            console.log(result);
        }
        catch (error) {
            console.error("Error uploading image", error);
        }
    }
    
    // Upload Image Button Input Style
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });

    const navigate = useNavigate();
    const now = dayjs();
    const ts = now.unix();
    const formik = useFormik({
        initialValues: {
            prod_name: "",
            prod_price: "",
            description: "",
            imgId: ""
        },
        validationSchema: yup.object({
            prod_name: yup.string().trim().min(3).max(100).required("Product Name is required"),
            prod_price: yup
                .string()
                .trim()
                .matches("^[0-9]*\\.[0-9]*$", "Invalid price format")
                .required("Product Price is required"),
            description: yup.string().trim().min(3).max(500).required("Description is required")
        }),
        onSubmit: (data) => {
            data.prod_name = data.prod_name.trim();
            data.prod_price = data.prod_price.trim();
            data.description = data.description.trim();
            data.imgId = `${ts}${data.prod_name.replaceAll(" ", "")}`;
            console.log(data);
            handleImgUpload(img, data.imgId).then((res) => {
                console.log(res);
                http.post("/products", data).then((res) => {
                    console.log(res.data);
                    navigate("/products");
                });
            });
        }
    });

    return (
        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
                        Add New Product
                    </Typography>
                    <Button
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUpload />}
                        sx ={{ display:"flex", justifySelf: "center"}}
                        >
                        Upload Image
                        <VisuallyHiddenInput
                            type="file"
                            onChange={handleImgChange}
                            multiple
                        />
                    </Button>
                    {
                        img ? (
                            <Container sx={{mt:3}}>
                                <img 
                                    style={{width:"100%"}}
                                    src={imgURL}
                                    loading="lazy"
                                />
                            </Container>
                        ) : <></>
                    }
                    { 
                        err ? (
                            <Typography sx={{display:"flex", justifySelf:"center", color:"red", mt: 3}}>
                                {err}
                            </Typography>
                        ) : <></>
                    }
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            autoComplete="off"
                            label="Product Name"
                            name="prod_name"
                            value={formik.values.prod_name}
                            onChange={formik.handleChange}
                            error={formik.touched.prod_name && Boolean(formik.errors.prod_name)}
                            helperText={formik.touched.prod_name && formik.errors.prod_name}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            autoComplete="off"
                            label="Product Price ($)"
                            name="prod_price"
                            value={formik.values.prod_price}
                            onChange={formik.handleChange}
                            error={formik.touched.prod_price && Boolean(formik.errors.prod_price)}
                            helperText={formik.touched.prod_price && formik.errors.prod_price}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            autoComplete="off"
                            multiline
                            minRows={3}
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{
                                    px: 4,
                                    py: 1,
                                    fontSize: "1rem",
                                    borderRadius: 3,
                                    backgroundColor: "#4caf50",
                                    "&:hover": {
                                        backgroundColor: "#43a047"
                                    },
                                }}
                            >
                                Add Product
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default NewProduct;