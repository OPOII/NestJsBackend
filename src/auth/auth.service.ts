import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';


import { User } from './entities/user.entity';
import { CreateAuthDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel:Model<User>
  ){}

  async create(createUserDto: CreateAuthDto):Promise<User>{
    
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

  async login(loginDto:LoginDto){


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
      token:'ABC'
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
}
