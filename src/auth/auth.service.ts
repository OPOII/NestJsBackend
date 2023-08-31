import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';


import { User } from './entities/user.entity';
import { CreateUserDTO,LoginDto,RegisterDTO,UpdateAuthDto} from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel:Model<User>,
    private jwtService:JwtService
  ){}

  async create(createUserDto: CreateUserDTO):Promise<User>{
    
    try {

      const {password, ...userData}=createUserDto;
      const newUser=new this.userModel({
        password:bcrypt.hashSync(password,10),
        ...userData
      });
      await newUser.save();
      const {password:_,...user}=newUser.toJSON();
      return user;

    } catch (error) {
      if(error.code===11000){
        throw new BadRequestException(`${createUserDto.email} already exist`);
      }
      throw new InternalServerErrorException('Something terrible happened');
      console.log(error.code)
    }

  }

  async register(registerDTO:RegisterDTO):Promise<LoginResponse>{
    //Validacion de si las contraseñas son iguales
    if(registerDTO.password!==registerDTO.password2){
       throw new BadRequestException('Las contraseñas no son iguales');
    }
    const userdto:CreateUserDTO={
      email:registerDTO.email,
      password:registerDTO.password,
      name:registerDTO.name
    }
    const response=await this.create(userdto);
    
    return {
      user:response,
      token:await this.getJwtToken({id:response._id})
    };

  }

  async login(loginDto:LoginDto):Promise<LoginResponse>{

    const{email,password}=loginDto;
    const user=await this.userModel.findOne({email});
    if(!user){
      throw new UnauthorizedException('Not valid credentials - email');
    }
    if(!bcrypt.compareSync(password,user.password)){
      throw new UnauthorizedException('Not valid credentiasl - password');
    }

    const{password:_,...rest}=user.toJSON();

    return {
      user:rest,
      token:this.getJwtToken({id:user.id})
    };

    

    /**
     * User {_id,name,email,roles}
     * Token->Json web token
     */
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  getJwtToken(payload:JwtPayload){
    const token=this.jwtService.sign(payload);
    return token;
  }
}
